/**
 * Pharmacies-Medplum Page Component
 * Manages pharmacy organizations using FHIR data with comprehensive UI
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Grid,
  Card,
  Text,
  Title,
  Group,
  Stack,
  Badge,
  Button,
  TextInput,
  Select,
  ActionIcon,
  Modal,
  Center,
  Loader,
  Alert,
  Avatar,
  Tabs,
  Table,
  Textarea,
  NumberInput,
  Switch,
  Divider,
} from '@mantine/core';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Building,
  Phone,
  Mail,
  MapPin,
  Filter,
  Database,
  AlertCircle,
  Pill,
  Star,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import { Organization } from '@medplum/fhirtypes';
import { backendFHIRService } from '../../services/backendFHIRService';

/**
 * FHIR Pharmacy Card Component
 */
interface FHIRPharmacyCardProps {
  pharmacy: Organization;
  onView: (pharmacy: Organization) => void;
  onEdit: (pharmacy: Organization) => void;
}

const FHIRPharmacyCard: React.FC<FHIRPharmacyCardProps> = ({ pharmacy, onView, onEdit }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      case 'pending':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'retail':
        return 'blue';
      case 'hospital':
        return 'green';
      case 'mail_order':
        return 'orange';
      case 'specialty':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const formatFillTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else if (minutes < 1440) {
      return `${Math.round(minutes / 60)} hrs`;
    } else {
      return `${Math.round(minutes / 1440)} days`;
    }
  };

  const getPharmacyName = () => {
    return pharmacy.name || 'Unknown Pharmacy';
  };

  const getPhone = () => {
    const phone = pharmacy.telecom?.find(t => t.system === 'phone');
    return phone?.value || 'No phone';
  };

  const getEmail = () => {
    const email = pharmacy.telecom?.find(t => t.system === 'email');
    return email?.value || 'No email';
  };

  const getAddress = () => {
    const address = pharmacy.address?.[0];
    if (address) {
      const parts = [
        address.line?.join(', '),
        address.city,
        address.state,
        address.postalCode
      ].filter(Boolean);
      return parts.join(', ') || 'No address';
    }
    return 'No address';
  };

  const getType = () => {
    return pharmacy.type?.[0]?.text || 'retail';
  };

  const getStatus = () => {
    return pharmacy.active ? 'active' : 'inactive';
  };

  // Mock data for enhanced features (in real implementation, this would come from FHIR extensions or related resources)
  const mockRating = 4.2 + Math.random() * 0.8;
  const mockPrescriptions = Math.floor(Math.random() * 2000) + 500;
  const mockFillTime = Math.floor(Math.random() * 30) + 10;
  const mockServices = ['Prescription Filling', 'Vaccinations', 'Health Screenings'];
  const mockDeliveryAvailable = Math.random() > 0.5;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Avatar size="lg" radius="md" color="blue">
              <Building size={24} />
            </Avatar>
            <Stack gap={4}>
              <Text fw={500} size="lg">
                {getPharmacyName()}
              </Text>
              <Text size="sm" c="dimmed">
                {pharmacy.id} • {getType()}
              </Text>
              <Group gap="xs">
                <Star size={14} fill="gold" color="gold" />
                <Text size="sm" fw={500}>
                  {mockRating.toFixed(1)}
                </Text>
                <Text size="sm" c="dimmed">
                  ({mockPrescriptions} prescriptions)
                </Text>
              </Group>
            </Stack>
          </Group>
          <Group>
            <Badge color={getStatusColor(getStatus())}>
              {getStatus()}
            </Badge>
            <Badge color={getTypeColor(getType())}>
              {getType()}
            </Badge>
          </Group>
        </Group>

        <Stack gap="xs">
          <Group gap="xs">
            <MapPin size={14} />
            <Text size="sm" lineClamp={2}>
              {getAddress()}
            </Text>
          </Group>
          <Group gap="xs">
            <Phone size={14} />
            <Text size="sm">{getPhone()}</Text>
          </Group>
          <Group gap="xs">
            <Mail size={14} />
            <Text size="sm">{getEmail()}</Text>
          </Group>
          <Group gap="xs">
            <Clock size={14} />
            <Text size="sm">Avg fill time: {formatFillTime(mockFillTime)}</Text>
          </Group>
        </Stack>

        <Group justify="space-between" align="center">
          <Group gap="xs">
            {mockDeliveryAvailable && (
              <Badge size="sm" color="green" leftSection={<Truck size={12} />}>
                Delivery
              </Badge>
            )}
            <Badge size="sm" variant="light">
              {mockServices.length} services
            </Badge>
          </Group>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => onView(pharmacy)}
            >
              <Eye size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => onEdit(pharmacy)}
            >
              <Edit size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * FHIR Pharmacy Details Modal
 */
interface FHIRPharmacyDetailsModalProps {
  pharmacy: Organization | null;
  opened: boolean;
  onClose: () => void;
}

const FHIRPharmacyDetailsModal: React.FC<FHIRPharmacyDetailsModalProps> = ({
  pharmacy,
  opened,
  onClose,
}) => {
  if (!pharmacy) return null;

  // Mock enhanced data for demonstration - in real implementation, this would come from FHIR extensions or related resources
  const mockData = {
    rating: 4.5,
    totalPrescriptions: 1250,
    avgFillTime: '15 mins',
    services: ['Prescription Filling', 'Vaccinations', 'Health Screenings', 'Medication Counseling', 'Diabetes Management', 'Blood Pressure Monitoring'],
    deliveryAvailable: true,
    website: 'https://pharmacy.example.com',
    licenseNumber: 'PH-2024-001',
    npiNumber: '1234567890',
    contactPerson: 'Dr. Sarah Johnson',
    hours: {
      monday: '8:00 AM - 9:00 PM',
      tuesday: '8:00 AM - 9:00 PM',
      wednesday: '8:00 AM - 9:00 PM',
      thursday: '8:00 AM - 9:00 PM',
      friday: '8:00 AM - 9:00 PM',
      saturday: '9:00 AM - 7:00 PM',
      sunday: '10:00 AM - 6:00 PM',
    },
    insurance: ['Blue Cross Blue Shield', 'Aetna', 'Cigna', 'UnitedHealth', 'Medicare', 'Medicaid', 'Humana', 'Kaiser Permanente'],
    contract: {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      contactPerson: 'Michael Chen',
      performanceMetrics: {
        totalPrescriptions: 15420,
        customerRating: 4.5,
        avgFillTime: '15 mins'
      }
    }
  };

  // Extract contact information from FHIR data
  const phoneContact = pharmacy.telecom?.find(t => t.system === 'phone');
  const emailContact = pharmacy.telecom?.find(t => t.system === 'email');
  const address = pharmacy.address?.[0];

  return (
    <Modal opened={opened} onClose={onClose} title={pharmacy.name || 'Pharmacy Details'} size="xl">
      <Tabs defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="hours">Hours & Services</Tabs.Tab>
          <Tabs.Tab value="insurance">Insurance</Tabs.Tab>
          <Tabs.Tab value="contract">Contract</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <Stack gap="lg">
            <Alert icon={<Database size={16} />} color="green" variant="light">
              Live FHIR Data - Organization ID: {pharmacy.id}
            </Alert>
            
            {/* Contact Information */}
            <Card withBorder padding="md">
              <Text size="sm" fw={600} mb="md">Contact Information</Text>
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Email</Text>
                    <Text size="sm" c="dimmed">{emailContact?.value || 'Not provided'}</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Website</Text>
                    <Text size="sm" c="dimmed">{mockData.website}</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Phone</Text>
                    <Text size="sm" c="dimmed">{phoneContact?.value || 'Not provided'}</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Address</Text>
                    <Text size="sm" c="dimmed">
                      {address ? `${address.line?.[0] || ''}, ${address.city || ''}, ${address.state || ''} ${address.postalCode || ''}` : 'Not provided'}
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Card>

            {/* Pharmacy Details */}
            <Card withBorder padding="md">
              <Text size="sm" fw={600} mb="md">Pharmacy Details</Text>
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>License Number</Text>
                    <Text size="sm" c="dimmed">{mockData.licenseNumber}</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>NPI Number</Text>
                    <Text size="sm" c="dimmed">{mockData.npiNumber}</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Contact Person</Text>
                    <Text size="sm" c="dimmed">{mockData.contactPerson}</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Average Fill Time</Text>
                    <Group gap="xs">
                      <Clock size={16} />
                      <Text size="sm" c="dimmed">{mockData.avgFillTime}</Text>
                    </Group>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Status</Text>
                    <Badge color={pharmacy.active ? 'green' : 'red'}>
                      {pharmacy.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Delivery Available</Text>
                    <Group gap="xs">
                      {mockData.deliveryAvailable ? (
                        <>
                          <CheckCircle size={16} color="green" />
                          <Text size="sm" c="green">Yes</Text>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} color="red" />
                          <Text size="sm" c="red">No</Text>
                        </>
                      )}
                    </Group>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Card>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="hours" pt="md">
          <Stack gap="lg">
            {/* Operating Hours */}
            <Card withBorder padding="md">
              <Text size="sm" fw={600} mb="md">Operating Hours</Text>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Day</Table.Th>
                    <Table.Th>Hours</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {Object.entries(mockData.hours).map(([day, hours]) => (
                    <Table.Tr key={day}>
                      <Table.Td style={{ textTransform: 'capitalize', fontWeight: 500 }}>{day}</Table.Td>
                      <Table.Td>{hours}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
            
            {/* Services */}
            <Card withBorder padding="md">
              <Text size="sm" fw={600} mb="md">Services Offered</Text>
              <Grid>
                {mockData.services.map((service, index) => (
                  <Grid.Col key={index} span={6}>
                    <Group gap="xs">
                      <CheckCircle size={16} color="green" />
                      <Text size="sm">{service}</Text>
                    </Group>
                  </Grid.Col>
                ))}
              </Grid>
            </Card>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="insurance" pt="md">
          <Card withBorder padding="md">
            <Text size="sm" fw={600} mb="md">Accepted Insurance Plans</Text>
            <Grid>
              {mockData.insurance.map((plan, index) => (
                <Grid.Col key={index} span={6}>
                  <Group gap="xs">
                    <CheckCircle size={16} color="green" />
                    <Text size="sm">{plan}</Text>
                  </Group>
                </Grid.Col>
              ))}
            </Grid>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="contract" pt="md">
          <Stack gap="lg">
            {/* Contract Information */}
            <Card withBorder padding="md">
              <Text size="sm" fw={600} mb="md">Contract Information</Text>
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Contract Start Date</Text>
                    <Text size="sm" c="dimmed">{mockData.contract.startDate}</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Contract End Date</Text>
                    <Text size="sm" c="dimmed">{mockData.contract.endDate}</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Contract Manager</Text>
                    <Text size="sm" c="dimmed">{mockData.contract.contactPerson}</Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Card>

            {/* Performance Metrics */}
            <Card withBorder padding="md">
              <Text size="sm" fw={600} mb="md">Performance Metrics</Text>
              <Grid>
                <Grid.Col span={4}>
                  <Stack gap="xs" align="center">
                    <Package size={24} color="blue" />
                    <Text size="lg" fw={700} c="blue">
                      {mockData.contract.performanceMetrics.totalPrescriptions.toLocaleString()}
                    </Text>
                    <Text size="sm" c="dimmed" ta="center">Total Prescriptions</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Stack gap="xs" align="center">
                    <Star size={24} color="gold" />
                    <Text size="lg" fw={700} c="yellow">
                      {mockData.contract.performanceMetrics.customerRating}
                    </Text>
                    <Text size="sm" c="dimmed" ta="center">Customer Rating</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Stack gap="xs" align="center">
                    <Clock size={24} color="green" />
                    <Text size="lg" fw={700} c="green">
                      {mockData.contract.performanceMetrics.avgFillTime}
                    </Text>
                    <Text size="sm" c="dimmed" ta="center">Avg Fill Time</Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Card>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
};

/**
 * FHIR Pharmacy Table Row Component
 */
interface FHIRPharmacyTableRowProps {
  pharmacy: Organization;
  onView: (pharmacy: Organization) => void;
  onEdit: (pharmacy: Organization) => void;
}

const FHIRPharmacyTableRow: React.FC<FHIRPharmacyTableRowProps> = ({ pharmacy, onView, onEdit }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      case 'pending':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'retail':
        return 'blue';
      case 'hospital':
        return 'green';
      case 'mail_order':
        return 'orange';
      case 'specialty':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const formatFillTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else if (minutes < 1440) {
      return `${Math.round(minutes / 60)} hrs`;
    } else {
      return `${Math.round(minutes / 1440)} days`;
    }
  };

  const getPharmacyName = () => pharmacy.name || 'Unknown Pharmacy';
  const getType = () => pharmacy.type?.[0]?.text || 'retail';
  const getStatus = () => pharmacy.active ? 'active' : 'inactive';

  const getAddress = () => {
    const address = pharmacy.address?.[0];
    if (address) {
      return `${address.line?.join(', ')}, ${address.city}, ${address.state}`;
    }
    return 'No address';
  };

  const getPhone = () => {
    const phone = pharmacy.telecom?.find(t => t.system === 'phone');
    return phone?.value || 'No phone';
  };

  // Mock data
  const mockRating = 4.2 + Math.random() * 0.8;
  const mockFillTime = Math.floor(Math.random() * 30) + 10;
  const mockServices = ['Prescription Filling', 'Vaccinations', 'Health Screenings'];
  const mockDeliveryAvailable = Math.random() > 0.5;

  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="sm">
          <Avatar size="sm" radius="md" color="blue">
            <Building size={16} />
          </Avatar>
          <Stack gap={2}>
            <Text fw={500} size="sm">
              {getPharmacyName()}
            </Text>
            <Text size="xs" c="dimmed">
              {pharmacy.id}
            </Text>
          </Stack>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge color={getTypeColor(getType())} size="sm">
          {getType()}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{getAddress()}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{getPhone()}</Text>
      </Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(getStatus())} size="sm">
          {getStatus()}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Star size={12} fill="gold" color="gold" />
          <Text size="sm" fw={500}>
            {mockRating.toFixed(1)}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{formatFillTime(mockFillTime)}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          {mockDeliveryAvailable && (
            <Badge size="xs" color="green" leftSection={<Truck size={10} />}>
              Delivery
            </Badge>
          )}
          <Badge size="xs" variant="light">
            {mockServices.length} services
          </Badge>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="light"
            color="blue"
            size="sm"
            onClick={() => onView(pharmacy)}
          >
            <Eye size={14} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="orange"
            size="sm"
            onClick={() => onEdit(pharmacy)}
          >
            <Edit size={14} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};

/**
 * Main Pharmacies-Medplum Page Component
 */
const PharmaciesMedplumPage: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Organization | null>(null);

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // Fetch FHIR pharmacy organizations
  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await backendFHIRService.searchResources('Organization', {
          type: 'prov',
          _sort: 'name',
          _count: '50'
        });

        const pharmacyData = (response?.data ?? []) as Organization[];
        setPharmacies(pharmacyData);
      } catch (err) {
        console.error('Error fetching FHIR pharmacies:', err);
        setError('Failed to fetch pharmacies from FHIR server. Please check your connection.');
        setPharmacies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, []);

  // Filter pharmacies
  const filteredPharmacies = useMemo(() => {
    return pharmacies.filter(pharmacy => {
      const matchesSearch = !searchTerm || 
        pharmacy.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.type?.[0]?.text?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && pharmacy.active) ||
        (statusFilter === 'inactive' && !pharmacy.active);

      const matchesType = !typeFilter || 
        pharmacy.type?.[0]?.text?.toLowerCase().includes(typeFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [pharmacies, searchTerm, statusFilter, typeFilter]);

  // Calculate summary statistics
  const activePharmacies = pharmacies.filter(p => p.active).length;
  const totalPrescriptions = pharmacies.reduce((sum) => sum + Math.floor(Math.random() * 2000) + 500, 0);
  const avgRating = pharmacies.length > 0 ? (4.2 + Math.random() * 0.8) : 0;
  const deliveryPharmacies = Math.floor(pharmacies.length * 0.7); // Mock 70% have delivery

  const handleViewPharmacy = (pharmacy: Organization) => {
    setSelectedPharmacy(pharmacy);
    openDetails();
  };

  const handleEditPharmacy = (pharmacy: Organization) => {
    setSelectedPharmacy(pharmacy);
    openEdit();
  };

  const handleSavePharmacy = (organization: Organization) => {
    // TODO: Integrate with Medplum createOrganization hook
    setPharmacies(prev => [...prev, organization]);
    console.log('Created pharmacy:', organization);
  };

  const handleUpdatePharmacy = (updatedOrganization: Organization) => {
    // TODO: Integrate with Medplum updateOrganization hook
    setPharmacies(prev => prev.map(p => p.id === updatedOrganization.id ? updatedOrganization : p));
    console.log('Updated pharmacy:', updatedOrganization);
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading FHIR pharmacies...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Pharmacy Partners</Title>
            <Text c="dimmed">Manage pharmacy partnerships and prescription fulfillment</Text>
          </div>
          <Button leftSection={<Plus size={16} />} onClick={openCreate}>
            Add Pharmacy
          </Button>
        </Group>

        {/* Error Alert */}
        {error && (
          <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Active Pharmacies
                </Text>
                <ActionIcon variant="light" color="green" size="lg">
                  <Building size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="green">
                {activePharmacies}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Total Prescriptions
                </Text>
                <ActionIcon variant="light" color="blue" size="lg">
                  <Package size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="blue">
                {totalPrescriptions.toLocaleString()}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Average Rating
                </Text>
                <ActionIcon variant="light" color="yellow" size="lg">
                  <Star size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="yellow">
                {avgRating.toFixed(1)}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Delivery Available
                </Text>
                <ActionIcon variant="light" color="indigo" size="lg">
                  <Truck size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="indigo">
                {deliveryPharmacies}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Filters */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Grid align="end">
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <TextInput
                placeholder="Search pharmacies..."
                leftSection={<Search size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                placeholder="Filter by status"
                leftSection={<Filter size={16} />}
                data={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'pending', label: 'Pending' },
                ]}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value || 'all')}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                placeholder="Filter by type"
                leftSection={<Building size={16} />}
                data={[
                  { value: 'retail', label: 'Retail' },
                  { value: 'hospital', label: 'Hospital' },
                  { value: 'mail_order', label: 'Mail Order' },
                  { value: 'specialty', label: 'Specialty' },
                ]}
                value={typeFilter}
                onChange={setTypeFilter}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 6 }}>
              <Group justify="flex-end">
                <Button.Group>
                  <Button
                    variant={viewMode === 'cards' ? 'filled' : 'light'}
                    onClick={() => setViewMode('cards')}
                    size="sm"
                  >
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'filled' : 'light'}
                    onClick={() => setViewMode('table')}
                    size="sm"
                  >
                    Table
                  </Button>
                </Button.Group>
              </Group>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Pharmacies Content */}
        {loading ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Loader size="lg" />
              <Text>Loading FHIR pharmacies...</Text>
            </Stack>
          </Center>
        ) : viewMode === 'cards' ? (
          <Grid>
            {filteredPharmacies.map((pharmacy) => (
              <Grid.Col key={pharmacy.id} span={{ base: 12, sm: 6, lg: 4 }}>
                <FHIRPharmacyCard
                  pharmacy={pharmacy}
                  onView={handleViewPharmacy}
                  onEdit={handleEditPharmacy}
                />
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Pharmacy</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Address</Table.Th>
                  <Table.Th>Phone</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Rating</Table.Th>
                  <Table.Th>Fill Time</Table.Th>
                  <Table.Th>Services</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredPharmacies.map((pharmacy) => (
                  <FHIRPharmacyTableRow
                    key={pharmacy.id}
                    pharmacy={pharmacy}
                    onView={handleViewPharmacy}
                    onEdit={handleEditPharmacy}
                  />
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        )}

        {/* Empty State */}
        {!loading && filteredPharmacies.length === 0 && (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Building size={48} color="gray" />
              <Text size="lg" c="dimmed">
                No pharmacies found
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                {searchTerm || statusFilter !== 'all' || typeFilter
                  ? 'Try adjusting your search criteria'
                  : error 
                    ? 'Check your FHIR server connection'
                    : 'Get started by adding your first pharmacy partner'}
              </Text>
              <Button leftSection={<Plus size={16} />} onClick={openCreate}>
                Add Pharmacy
              </Button>
            </Stack>
          </Center>
        )}
      </Stack>

      {/* Pharmacy Details Modal */}
      <FHIRPharmacyDetailsModal
        pharmacy={selectedPharmacy}
        opened={detailsOpened}
        onClose={closeDetails}
      />

      {/* Create and Edit Modals */}
      <CreateFHIRPharmacyModal
        opened={createOpened}
        onClose={closeCreate}
        onSave={handleSavePharmacy}
      />

      <EditFHIRPharmacyModal
        opened={editOpened}
        onClose={closeEdit}
        onSave={handleUpdatePharmacy}
        organization={selectedPharmacy}
      />
    </Container>
  );
};

export default PharmaciesMedplumPage;

/**
 * Create FHIR Pharmacy Modal Component
 * Purpose: Modal for creating new FHIR Organization resources as pharmacies
 * Inputs: opened (boolean), onClose (function), onSave (function)
 * Outputs: Creates new FHIR Organization with pharmacy data
 */
interface CreateFHIRPharmacyModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (organization: Organization) => void;
}

const CreateFHIRPharmacyModal: React.FC<CreateFHIRPharmacyModalProps> = ({
  opened,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    licenseNumber: '',
    npiNumber: '',
    contactPerson: '',
    type: 'retail',
    deliveryAvailable: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Validates form data before submission
   * Returns: boolean indicating if form is valid
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Pharmacy name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (!formData.npiNumber.trim()) newErrors.npiNumber = 'NPI number is required';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission and creates FHIR Organization
   */
  const handleSubmit = () => {
    if (!validateForm()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fix the errors in the form',
        color: 'red',
      });
      return;
    }

    try {
      // Create FHIR Organization resource
      const newOrganization: Organization = {
        resourceType: 'Organization',
        id: `pharmacy-${Date.now()}`,
        active: true,
        type: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/organization-type',
                code: 'prov',
                display: 'Healthcare Provider',
              },
            ],
          },
        ],
        name: formData.name,
        telecom: [
          {
            system: 'phone',
            value: formData.phone,
            use: 'work',
          },
          {
            system: 'email',
            value: formData.email,
            use: 'work',
          },
          ...(formData.website ? [{
            system: 'url' as const,
            value: formData.website,
            use: 'work' as const,
          }] : []),
        ],
        address: [
          {
            use: 'work',
            type: 'physical',
            line: [formData.address],
            city: formData.city,
            state: formData.state,
            postalCode: formData.zipCode,
            country: 'US',
          },
        ],
        // Store additional pharmacy-specific data in extensions
        extension: [
          {
            url: 'http://example.com/fhir/StructureDefinition/pharmacy-type',
            valueString: formData.type,
          },
          {
            url: 'http://example.com/fhir/StructureDefinition/license-number',
            valueString: formData.licenseNumber,
          },
          {
            url: 'http://example.com/fhir/StructureDefinition/npi-number',
            valueString: formData.npiNumber,
          },
          {
            url: 'http://example.com/fhir/StructureDefinition/contact-person',
            valueString: formData.contactPerson,
          },
          {
            url: 'http://example.com/fhir/StructureDefinition/delivery-available',
            valueBoolean: formData.deliveryAvailable,
          },
        ],
      };

      onSave(newOrganization);
      
      notifications.show({
        title: 'Success',
        message: 'Pharmacy created successfully',
        color: 'green',
      });

      // Reset form
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        email: '',
        website: '',
        licenseNumber: '',
        npiNumber: '',
        contactPerson: '',
        type: 'retail',
        deliveryAvailable: false,
      });
      setErrors({});
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create pharmacy',
        color: 'red',
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add New Pharmacy"
      size="lg"
    >
      <Stack gap="md">
        <TextInput
          label="Pharmacy Name"
          placeholder="Enter pharmacy name"
          value={formData.name}
          onChange={(event) => setFormData({ ...formData, name: event.currentTarget.value })}
          error={errors.name}
          required
        />

        <Grid>
          <Grid.Col span={8}>
            <TextInput
              label="Address"
              placeholder="Enter street address"
              value={formData.address}
              onChange={(event) => setFormData({ ...formData, address: event.currentTarget.value })}
              error={errors.address}
              required
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label="Type"
              data={[
                { value: 'retail', label: 'Retail Pharmacy' },
                { value: 'hospital', label: 'Hospital Pharmacy' },
                { value: 'mail_order', label: 'Mail Order' },
                { value: 'specialty', label: 'Specialty Pharmacy' },
              ]}
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value || 'retail' })}
              required
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="City"
              placeholder="Enter city"
              value={formData.city}
              onChange={(event) => setFormData({ ...formData, city: event.currentTarget.value })}
              error={errors.city}
              required
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="State"
              placeholder="State"
              value={formData.state}
              onChange={(event) => setFormData({ ...formData, state: event.currentTarget.value })}
              error={errors.state}
              required
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="ZIP Code"
              placeholder="ZIP"
              value={formData.zipCode}
              onChange={(event) => setFormData({ ...formData, zipCode: event.currentTarget.value })}
              error={errors.zipCode}
              required
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(event) => setFormData({ ...formData, phone: event.currentTarget.value })}
              error={errors.phone}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.currentTarget.value })}
              error={errors.email}
              required
            />
          </Grid.Col>
        </Grid>

        <TextInput
          label="Website (Optional)"
          placeholder="Enter website URL"
          value={formData.website}
          onChange={(event) => setFormData({ ...formData, website: event.currentTarget.value })}
        />

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="License Number"
              placeholder="Enter license number"
              value={formData.licenseNumber}
              onChange={(event) => setFormData({ ...formData, licenseNumber: event.currentTarget.value })}
              error={errors.licenseNumber}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="NPI Number"
              placeholder="Enter NPI number"
              value={formData.npiNumber}
              onChange={(event) => setFormData({ ...formData, npiNumber: event.currentTarget.value })}
              error={errors.npiNumber}
              required
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={8}>
            <TextInput
              label="Contact Person"
              placeholder="Enter primary contact person"
              value={formData.contactPerson}
              onChange={(event) => setFormData({ ...formData, contactPerson: event.currentTarget.value })}
              error={errors.contactPerson}
              required
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Delivery Available</Text>
              <Switch
                checked={formData.deliveryAvailable}
                onChange={(event) => setFormData({ ...formData, deliveryAvailable: event.currentTarget.checked })}
              />
            </Stack>
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Pharmacy
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Edit FHIR Pharmacy Modal Component
 * Purpose: Modal for editing existing FHIR Organization resources
 * Inputs: opened (boolean), onClose (function), onSave (function), organization (Organization)
 * Outputs: Updates FHIR Organization with modified pharmacy data
 */
interface EditFHIRPharmacyModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (organization: Organization) => void;
  organization: Organization | null;
}

const EditFHIRPharmacyModal: React.FC<EditFHIRPharmacyModalProps> = ({
  opened,
  onClose,
  onSave,
  organization,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    licenseNumber: '',
    npiNumber: '',
    contactPerson: '',
    type: 'retail',
    deliveryAvailable: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Populates form data when organization changes
   */
  useEffect(() => {
    if (organization) {
      const phone = organization.telecom?.find(t => t.system === 'phone')?.value || '';
      const email = organization.telecom?.find(t => t.system === 'email')?.value || '';
      const website = organization.telecom?.find(t => t.system === 'url')?.value || '';
      const address = organization.address?.[0];
      
      // Extract pharmacy-specific data from extensions
      const getExtensionValue = (url: string) => {
        const extension = organization.extension?.find(ext => ext.url === url);
        return extension?.valueString || extension?.valueBoolean || '';
      };

      setFormData({
        name: organization.name || '',
        address: address?.line?.[0] || '',
        city: address?.city || '',
        state: address?.state || '',
        zipCode: address?.postalCode || '',
        phone,
        email,
        website,
        licenseNumber: getExtensionValue('http://example.com/fhir/StructureDefinition/license-number') as string,
        npiNumber: getExtensionValue('http://example.com/fhir/StructureDefinition/npi-number') as string,
        contactPerson: getExtensionValue('http://example.com/fhir/StructureDefinition/contact-person') as string,
        type: getExtensionValue('http://example.com/fhir/StructureDefinition/pharmacy-type') as string || 'retail',
        deliveryAvailable: getExtensionValue('http://example.com/fhir/StructureDefinition/delivery-available') as boolean || false,
      });
    }
  }, [organization]);

  /**
   * Validates form data before submission
   * Returns: boolean indicating if form is valid
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Pharmacy name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (!formData.npiNumber.trim()) newErrors.npiNumber = 'NPI number is required';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission and updates FHIR Organization
   */
  const handleSubmit = () => {
    if (!validateForm()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fix the errors in the form',
        color: 'red',
      });
      return;
    }

    if (!organization) return;

    try {
      // Update FHIR Organization resource
      const updatedOrganization: Organization = {
        ...organization,
        name: formData.name,
        telecom: [
          {
            system: 'phone',
            value: formData.phone,
            use: 'work',
          },
          {
            system: 'email',
            value: formData.email,
            use: 'work',
          },
          ...(formData.website ? [{
            system: 'url' as const,
            value: formData.website,
            use: 'work' as const,
          }] : []),
        ],
        address: [
          {
            use: 'work',
            type: 'physical',
            line: [formData.address],
            city: formData.city,
            state: formData.state,
            postalCode: formData.zipCode,
            country: 'US',
          },
        ],
        // Update pharmacy-specific data in extensions
        extension: [
          {
            url: 'http://example.com/fhir/StructureDefinition/pharmacy-type',
            valueString: formData.type,
          },
          {
            url: 'http://example.com/fhir/StructureDefinition/license-number',
            valueString: formData.licenseNumber,
          },
          {
            url: 'http://example.com/fhir/StructureDefinition/npi-number',
            valueString: formData.npiNumber,
          },
          {
            url: 'http://example.com/fhir/StructureDefinition/contact-person',
            valueString: formData.contactPerson,
          },
          {
            url: 'http://example.com/fhir/StructureDefinition/delivery-available',
            valueBoolean: formData.deliveryAvailable,
          },
        ],
      };

      onSave(updatedOrganization);
      
      notifications.show({
        title: 'Success',
        message: 'Pharmacy updated successfully',
        color: 'green',
      });

      setErrors({});
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update pharmacy',
        color: 'red',
      });
    }
  };

  if (!organization) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Pharmacy"
      size="lg"
    >
      <Stack gap="md">
        <TextInput
          label="Pharmacy Name"
          placeholder="Enter pharmacy name"
          value={formData.name}
          onChange={(event) => setFormData({ ...formData, name: event.currentTarget.value })}
          error={errors.name}
          required
        />

        <Grid>
          <Grid.Col span={8}>
            <TextInput
              label="Address"
              placeholder="Enter street address"
              value={formData.address}
              onChange={(event) => setFormData({ ...formData, address: event.currentTarget.value })}
              error={errors.address}
              required
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label="Type"
              data={[
                { value: 'retail', label: 'Retail Pharmacy' },
                { value: 'hospital', label: 'Hospital Pharmacy' },
                { value: 'mail_order', label: 'Mail Order' },
                { value: 'specialty', label: 'Specialty Pharmacy' },
              ]}
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value || 'retail' })}
              required
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="City"
              placeholder="Enter city"
              value={formData.city}
              onChange={(event) => setFormData({ ...formData, city: event.currentTarget.value })}
              error={errors.city}
              required
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="State"
              placeholder="State"
              value={formData.state}
              onChange={(event) => setFormData({ ...formData, state: event.currentTarget.value })}
              error={errors.state}
              required
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="ZIP Code"
              placeholder="ZIP"
              value={formData.zipCode}
              onChange={(event) => setFormData({ ...formData, zipCode: event.currentTarget.value })}
              error={errors.zipCode}
              required
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(event) => setFormData({ ...formData, phone: event.currentTarget.value })}
              error={errors.phone}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.currentTarget.value })}
              error={errors.email}
              required
            />
          </Grid.Col>
        </Grid>

        <TextInput
          label="Website (Optional)"
          placeholder="Enter website URL"
          value={formData.website}
          onChange={(event) => setFormData({ ...formData, website: event.currentTarget.value })}
        />

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="License Number"
              placeholder="Enter license number"
              value={formData.licenseNumber}
              onChange={(event) => setFormData({ ...formData, licenseNumber: event.currentTarget.value })}
              error={errors.licenseNumber}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="NPI Number"
              placeholder="Enter NPI number"
              value={formData.npiNumber}
              onChange={(event) => setFormData({ ...formData, npiNumber: event.currentTarget.value })}
              error={errors.npiNumber}
              required
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={8}>
            <TextInput
              label="Contact Person"
              placeholder="Enter primary contact person"
              value={formData.contactPerson}
              onChange={(event) => setFormData({ ...formData, contactPerson: event.currentTarget.value })}
              error={errors.contactPerson}
              required
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Delivery Available</Text>
              <Switch
                checked={formData.deliveryAvailable}
                onChange={(event) => setFormData({ ...formData, deliveryAvailable: event.currentTarget.checked })}
              />
            </Stack>
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Update Pharmacy
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

// ... existing code ...