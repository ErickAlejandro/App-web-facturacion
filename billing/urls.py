from django.urls import path
from . import views

urlpatterns = [
    path('', views.view_fact, name='view_fact'),
    path('home/', views.page_home, name='page_home'),
    path('setting/', views.view_settings, name='view_settings'),
    path('enterprise/', views.view_enterprise, name='view_enterprise'),
    path('facturacion/', views.view_fact, name='view_fact'),
    path('login/', views.login, name='login'),
    path('getInfoRucMail/<str:mail_ruc>/', views.consult_bd, name='consultar_api'),
    path('createNewAccess/', views.create_new_access_sii4, name='createNewAccess'),
    path('loginAccess/', views.login_access, name="loginAccess"),
    path('logout/', views.logout_access, name='logout_access'),
    path('getProduct/<str:product>/', views.get_product, name="consultProduct"),
    path('getInfoTrans/', views.get_trans, name="getInfoTrans"),
    path('getEmpresa/', views.get_empresa, name="getEmpresa"),
    path('getExistencias/', views.get_existencias, name="getExistencias"),
    path('sendTrama/<str:infoTrama>/', views.send_trama, name='sendTrama'),
]
