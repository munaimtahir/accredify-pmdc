# backend/modules/management/commands/seed_pmdc_pg.py

from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

import yaml

from modules.models import Module
from proformas.models import ProformaTemplate, ProformaSection, ProformaItem


class Command(BaseCommand):
    help = "Seed PMDC Postgraduate Accreditation module from YAML (MODULE_PG_PMD2023.yaml)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--yaml",
            type=str,
            help="Optional path to YAML file. Defaults to <BASE_DIR>/docs/MODULE_PG_PMD2023.yaml",
        )

    def _get_yaml_path(self, override_path: str | None) -> Path:
        if override_path:
            path = Path(override_path).expanduser().resolve()
        else:
            # Go up from backend/modules/management/commands to project root
            base_dir = Path(__file__).resolve().parents[4]
            path = base_dir / "docs" / "MODULE_PG_PMD2023.yaml"
        if not path.exists():
            raise CommandError(f"YAML file not found at: {path}")
        return path

    def handle(self, *args, **options):
        yaml_path = self._get_yaml_path(options.get("yaml"))
        self.stdout.write(self.style.NOTICE(f"Loading PMDC-PG YAML from: {yaml_path}"))

        with yaml_path.open("r", encoding="utf-8") as f:
            data = yaml.safe_load(f)

        module_meta = data.get("module") or {}
        sections_data = data.get("sections") or []

        if not module_meta:
            raise CommandError("YAML file missing top-level 'module' key.")
        if not sections_data:
            self.stdout.write(self.style.WARNING("No 'sections' found in YAML — nothing to seed."))
            return

        code = module_meta.get("code")
        title = module_meta.get("title") or code
        authority = module_meta.get("authority", "PMDC")
        description = module_meta.get("description", "")
        version = module_meta.get("version", "1.0")

        if not code:
            raise CommandError("Module 'code' is required in YAML.")

        with transaction.atomic():
            # 1) Create / update Module
            module, created_module = Module.objects.get_or_create(
                code=code,
                defaults={
                    "display_name": title,
                    "description": description,
                },
            )
            if not created_module:
                # keep name/description fresh
                module.display_name = title
                module.description = description
                module.save(update_fields=["display_name", "description"])

            # 2) Create / update ProformaTemplate
            template, created_template = ProformaTemplate.objects.get_or_create(
                code=code,
                defaults={
                    "title": title,
                    "authority_name": authority,
                    "description": description,
                    "version": version,
                    "module": module,
                    "is_active": True,
                },
            )
            if not created_template:
                # make sure linked to the right Module and metadata is up-to-date
                template.title = title
                template.authority_name = authority
                template.description = description
                template.version = version
                template.module = module
                template.is_active = True
                template.save(
                    update_fields=[
                        "title",
                        "authority_name",
                        "description",
                        "version",
                        "module",
                        "is_active",
                    ]
                )

            # 3) Clear old sections/items for this template (fresh import)
            ProformaSection.objects.filter(template=template).delete()
            # (ProformaItem should cascade delete if FK is on_delete=models.CASCADE)

            total_sections = 0
            total_items = 0

            # 4) Create sections and items from YAML
            for s_idx, section_data in enumerate(sections_data, start=1):
                s_code = section_data.get("code") or f"S{s_idx}"
                s_title = section_data.get("title") or s_code
                s_desc = section_data.get("description", "")
                s_weight = section_data.get("weight", s_idx)

                section = ProformaSection.objects.create(
                    template=template,
                    code=s_code,
                    title=s_title,
                    description=s_desc,
                    weight=s_weight,
                )
                total_sections += 1

                for i_idx, item_data in enumerate(section_data.get("items") or [], start=1):
                    i_code = item_data.get("code") or f"{s_code}.{i_idx}"
                    i_text = item_data.get("text") or ""
                    i_evidence = item_data.get("evidence", "")
                    i_weight = item_data.get("weight", None)
                    i_critical = bool(item_data.get("critical", False))

                    ProformaItem.objects.create(
                        section=section,
                        code=i_code,
                        requirement_text=i_text,
                        required_evidence_type=i_evidence,
                        # Map YAML "weight" to importance_level (1–5 style),
                        # and keep scoring defaults for now.
                        importance_level=i_weight,
                        implementation_criteria="",
                        max_score=10,
                        weightage_percent=100,
                        is_licensing_critical=i_critical,
                    )
                    total_items += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded PMDC-PG module '{code}' with {total_sections} sections and {total_items} items."
            )
        )
