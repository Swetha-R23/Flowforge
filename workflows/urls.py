from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkflowViewSet, StepViewSet, RuleViewSet

# Main router
router = DefaultRouter()
router.register(r'workflows', WorkflowViewSet, basename='workflow')
router.register(r'steps', StepViewSet, basename='step')
router.register(r'rules', RuleViewSet, basename='rule')

urlpatterns = [
    path('', include(router.urls)),

    # Nested: workflows/{id}/steps/
    path('workflows/<uuid:workflow_pk>/steps/',
         StepViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='workflow-steps-list'),
    path('workflows/<uuid:workflow_pk>/steps/<uuid:pk>/',
         StepViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='workflow-steps-detail'),

    # Nested: steps/{id}/rules/
    path('steps/<uuid:step_pk>/rules/',
         RuleViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='step-rules-list'),
    path('steps/<uuid:step_pk>/rules/<uuid:pk>/',
         RuleViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='step-rules-detail'),
]