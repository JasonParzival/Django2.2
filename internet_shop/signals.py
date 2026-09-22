import pyotp
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Customer

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Customer.objects.create(
            user=instance,
            name=f"{instance.first_name} {instance.last_name}".strip() or instance.username,
            address="",
            phone_number="",
            email=instance.email,
            otp_key=pyotp.random_base32()
        )

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    Customer.objects.get_or_create(
        user=instance,
        defaults={
            'name': f"{instance.first_name} {instance.last_name}".strip() or instance.username,
            'address': "",
            'phone_number': "",
            'email': instance.email,
            'otp_key': pyotp.random_base32()
        }
    )