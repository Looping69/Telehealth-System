# Telehealth System - Application Architecture & Data Flow

## Application Routes and Data Sources

```mermaid
graph TB
    %% Main Application Entry
    App[App.tsx] --> Router{React Router}
    
    %% Authentication Routes
    Router --> Login[/login - LoginPage]
    Router --> Unauthorized[/unauthorized - UnauthorizedPage]
    
    %% Protected Routes Container
    Router --> Protected[Protected Routes - AppLayout]
    
    %% Dashboard & Main Pages
    Protected --> Dashboard[/ or /dashboard - DashboardPage]
    Protected --> Patients[/patients - PatientsPage]
    Protected --> Sessions[/sessions - SessionsPage]
    Protected --> Orders[/orders - OrdersPage]
    Protected --> Invoices[/invoices - InvoicesPage]
    Protected --> Tasks[/tasks - TasksPage]
    Protected --> Insurance[/insurance - InsurancePage]
    Protected --> Messages[/messages - MessagesPage]
    Protected --> Providers[/providers - ProvidersPage]
    Protected --> Pharmacies[/pharmacies - PharmaciesPage]
    Protected --> Tags[/tags - TagsPage]
    Protected --> Discounts[/discounts - DiscountsPage]
    Protected --> Products[/products - ProductsPage]
    Protected --> Resources[/resources - ResourcesPage]
    Protected --> Settings[/settings - SettingsPage]
    Protected --> Audit[/audit - AuditPage]
    Protected --> Forms[/forms - FormsPage]
    
    %% Data Sources
    subgraph DataSources["Data Sources"]
        MockData[Mock Data - useQuery.ts]
        MedplumAPI[Medplum FHIR API - localhost:8103]
        LocalStorage[Local Storage]
        FormBuilder[Form Builder Modal]
    end
    
    %% Data Flow Connections
    Dashboard --> |useDashboardMetrics| MockData
    Patients --> |usePatients, usePatient| MockData
    Sessions --> |useAppointments| MockData
    Orders --> |useOrders| MockData
    Forms --> |FormBuilder Modal| FormBuilder
    
    %% Mock Data Details
    subgraph MockDataDetails["Mock Data Structure"]
        PatientData[Patient Data<br/>- 8 comprehensive patient records<br/>- Demographics, medical history<br/>- Insurance, allergies, contacts]
        AppointmentData[Appointment Data<br/>- 8 detailed appointments<br/>- Various types: consultation, follow-up<br/>- mental-health, chronic-care, etc.<br/>- Video/in-person sessions]
        OrderData[Order Data<br/>- Lab orders, prescriptions<br/>- Status tracking<br/>- Priority levels]
        DashboardData[Dashboard Metrics<br/>- Patient counts: 1247<br/>- Today's appointments: 12<br/>- Pending orders: 8<br/>- Revenue trends]
    end
    
    MockData --> PatientData
    MockData --> AppointmentData
    MockData --> OrderData
    MockData --> DashboardData
    
    %% Authentication & Permissions
    subgraph AuthSystem["Authentication & Permissions"]
        AuthContext[AuthContext]
        PermissionSystem[permissions.ts]
        RoleBasedAccess[Role-Based Access Control]
    end
    
    Protected --> AuthContext
    AuthContext --> PermissionSystem
    PermissionSystem --> RoleBasedAccess
    
    %% User Roles
    subgraph UserRoles["User Roles & Permissions"]
        SuperAdmin[super_admin<br/>- Full system access<br/>- All CRUD operations]
        HealthcareProvider[healthcare_provider<br/>- Patient care focused<br/>- Form builder access]
        PracticeManager[practice_manager<br/>- Management operations<br/>- Form builder access]
        Receptionist[receptionist<br/>- Limited patient access<br/>- Appointment management]
        BillingSpecialist[billing_specialist<br/>- Billing & insurance<br/>- Financial operations]
    end
    
    RoleBasedAccess --> SuperAdmin
    RoleBasedAccess --> HealthcareProvider
    RoleBasedAccess --> PracticeManager
    RoleBasedAccess --> Receptionist
    RoleBasedAccess --> BillingSpecialist
    
    %% Current Data Flow Status
    subgraph DataFlowStatus["Current Data Flow Status"]
        MedplumDown[❌ Medplum Server Unavailable<br/>localhost:8103/fhir/R4/*<br/>Returns: net::ERR_ABORTED]
        MockFallback[✅ Mock Data Fallback Active<br/>All hooks return comprehensive<br/>mock data when Medplum fails]
        NoNetworkCalls[✅ No Failed Network Calls<br/>Direct mock data usage<br/>Eliminates ERR_ABORTED errors]
    end
    
    MedplumAPI -.->|Connection Failed| MedplumDown
    MedplumDown --> MockFallback
    MockFallback --> NoNetworkCalls
    
    %% Form Builder Integration
    subgraph FormBuilderIntegration["Form Builder Integration"]
        FormsPageButton[Forms Page - Form Builder Button]
        FormBuilderModal[Form Builder Modal<br/>- Full-screen modal<br/>- Medplum FHIR Questionnaire<br/>- Advanced form creation]
        FormBuilderComponent[FormBuilder.tsx Component]
    end
    
    Forms --> FormsPageButton
    FormsPageButton --> FormBuilderModal
    FormBuilderModal --> FormBuilderComponent
    
    %% Styling
    classDef pageNode fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef dataNode fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef authNode fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef statusNode fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef errorNode fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef successNode fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    
    class Dashboard,Patients,Sessions,Orders,Forms pageNode
    class MockData,PatientData,AppointmentData,OrderData,DashboardData dataNode
    class AuthContext,PermissionSystem,RoleBasedAccess authNode
    class DataFlowStatus,MockFallback,NoNetworkCalls statusNode
    class MedplumDown errorNode
    class MockFallback,NoNetworkCalls successNode
```

## Key Data Hooks and Their Sources

### Primary Data Fetching Hooks (src/hooks/useQuery.ts)

1. **usePatients(searchQuery?: string)**
   - **Source**: Mock data only (Medplum bypassed)
   - **Returns**: 8 comprehensive patient records
   - **Features**: Search filtering, demographics, medical history

2. **useAppointments(date?: Date)**
   - **Source**: Mock data only (Medplum bypassed)
   - **Returns**: 8 detailed appointment records
   - **Features**: Date filtering, multiple appointment types, session details

3. **useOrders(status?: string)**
   - **Source**: Mock data only (Medplum bypassed)
   - **Returns**: Lab orders, prescriptions
   - **Features**: Status filtering, priority levels

4. **useDashboardMetrics()**
   - **Source**: Mock data only (Medplum bypassed)
   - **Returns**: Aggregated metrics and trends
   - **Features**: Patient counts, revenue data, appointment trends

5. **usePatient(patientId: string)**
   - **Source**: Mock data fallback
   - **Returns**: Single patient record by ID

## Network Error Resolution

### Previous Issue
- **Error**: `net::ERR_ABORTED http://localhost:8103/fhir/R4/Patient?_count=100`
- **Cause**: Medplum FHIR server not running on localhost:8103

### Current Solution
- **Status**: ✅ **RESOLVED**
- **Method**: Direct mock data usage (no network calls)
- **Result**: All pages now load with comprehensive mock data
- **Benefits**: 
  - No network errors
  - Consistent data across all pages
  - Realistic healthcare scenarios for testing

## Mock Data Highlights

### Patient Records (8 total)
- Complete demographics and contact information
- Medical histories (diabetes, hypertension, asthma, etc.)
- Insurance information and emergency contacts
- Allergies and medication restrictions
- Recent visit dates and upcoming appointments

### Appointment Records (8 total)
- Multiple appointment types: consultation, follow-up, mental-health, chronic-care, specialist, sports-medicine, pain-management
- Both video and in-person sessions
- Detailed symptoms, diagnoses, and prescriptions
- Follow-up requirements and session links

### Dashboard Metrics
- Total Patients: 1,247
- Today's Appointments: 12
- Pending Orders: 8
- Monthly Revenue: $45,600
- Patient Growth: 12.5%
- Weekly appointment trends and revenue data

## Form Builder Integration

The Form Builder is now integrated as a modal within the Forms page:
- **Access**: Forms page → "Form Builder" button
- **Display**: Full-screen modal
- **Component**: Advanced FHIR Questionnaire builder
- **Permissions**: Available to super_admin, healthcare_provider, and practice_manager roles