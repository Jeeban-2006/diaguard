from django.urls import path
from .views import explain_risk, get_user_history, get_prediction_detail

urlpatterns = [
    path("explain-risk/", explain_risk),
    path("history/<str:username>/", get_user_history),
    path("prediction/<int:prediction_id>/", get_prediction_detail),
]
