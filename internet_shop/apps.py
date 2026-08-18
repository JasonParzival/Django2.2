from django.apps import AppConfig


class InternetShopConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'internet_shop'
    
    def ready(self):
        import internet_shop.signals
