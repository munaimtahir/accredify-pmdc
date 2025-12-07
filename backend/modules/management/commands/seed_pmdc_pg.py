from django.core.management.base import BaseCommand
from modules.models import Module
from proformas.models import ProformaTemplate, ProformaSection, ProformaItem

CATEGORIES = [
    "Opening a New Postgraduate Program",
    "Initial PG Section Evaluation",
    "Inspection & Verification",
    "Council Evaluation & Decision",
    "Federal Government Notification",
    "Admission of Students",
    "Qualification Framework Compliance",
    "Training Settings & Resources",
    "Evaluation of Training Process",
    "Assessment of Trainees",
    "Distance Learning Programs",
    "Governance Requirements",
]

class Command(BaseCommand):
    help = "Seeds PMDC Postgraduate Accreditation Module (2023)"

    def handle(self, *args, **kwargs):
        module, _ = Module.objects.get_or_create(
            code="PMDC-PG-2023",
            defaults={
                "display_name": "PMDC Postgraduate Accreditation (2023)",
                "description": "Accreditation of postgraduate programs according to PMDC regulations 2023.",
            },
        )

        template, _ = ProformaTemplate.objects.get_or_create(
            code="PMDC-PG-2023",
            module=module,
            defaults={
                "title": "PMDC Postgraduate Accreditation (2023)",
                "authority_name": "PMDC",
                "version": "1.0",
            },
        )

        for index, title in enumerate(CATEGORIES, start=1):
            section, _ = ProformaSection.objects.get_or_create(
                template=template,
                order=index,
                defaults={"title": title},
            )
            for i in range(1, 4):
                ProformaItem.objects.get_or_create(
                    section=section,
                    order=i,
                    defaults={
                        "text": f"{title} - sample requirement {i}",
                        "weight": 1,
                    },
                )

        self.stdout.write(self.style.SUCCESS("PMDC PG Module seeded with basic sections and items."))
