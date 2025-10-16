/**
 * Patients Page Component
 * Manages patient directory with search, filtering, and patient profiles
 */

import { useState } from 'react';
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
  Table,
  Avatar,
  ActionIcon,
  Modal,
  Pagination,
  Loader,
  Center,
} from '@mantine/core';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Filter,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { usePatients } from '../../hooks/useQuery';
import { Patient } from '../../types';
import { CreatePatientModal } from '../../components/CreatePatientModal';
import { EditPatientModal } from '../../components/EditPatientModal';

/**
 * Patient Card Component
 * Displays patient information in card format
 */
interface PatientCardProps {
  patient: Patient;
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onView, onEdit }) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Avatar size="lg" radius="xl" color="blue">
              {getInitials(patient.firstName, patient.lastName)}
            </Avatar>
            <Stack gap={4}>
              <Text fw={500} size="lg">
                {patient.firstName} {patient.lastName}
              </Text>
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  Age: {calculateAge(patient.dateOfBirth)}
                </Text>
                <Text size="sm" c="dimmed">
                  •
                </Text>
                <Text size="sm" c="dimmed">
                  {patient.gender}
                </Text>
              </Group>
            </Stack>
          </Group>
          <Badge color={patient.status === 'active' ? 'green' : 'gray'}>
            {patient.status}
          </Badge>
        </Group>

        <Stack gap="xs">
          <Group gap="xs">
            <Phone size={14} />
            <Text size="sm">{patient.phone}</Text>
          </Group>
          <Group gap="xs">
            <Mail size={14} />
            <Text size="sm">{patient.email}</Text>
          </Group>
          <Group gap="xs">
            <MapPin size={14} />
            <Text size="sm">
              {typeof patient.address === 'object' 
                ? `${patient.address.city}, ${patient.address.state}`
                : patient.address
              }
            </Text>
          </Group>
          <Group gap="xs">
            <Calendar size={14} />
            <Text size="sm">Last visit: {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'Never'}</Text>
          </Group>
        </Stack>

        <Group justify="flex-end" gap="xs">
          <ActionIcon
            variant="light"
            color="blue"
            onClick={() => onView(patient)}
          >
            <Eye size={16} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="orange"
            onClick={() => onEdit(patient)}
          >
            <Edit size={16} />
          </ActionIcon>
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * Patient Details Modal Component
 */
interface PatientDetailsModalProps {
  patient: Patient | null;
  opened: boolean;
  onClose: () => void;
}

const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  patient,
  opened,
  onClose,
}) => {
  if (!patient) return null;

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`${patient.firstName} ${patient.lastName}`}
      size="lg"
    >
      <Stack gap="md">
        <Group>
          <Avatar size="xl" radius="xl" color="blue">
            {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
          </Avatar>
          <Stack gap={4}>
            <Title order={3}>
              {patient.firstName} {patient.lastName}
            </Title>
            <Group gap="xs">
              <Badge color={patient.status === 'active' ? 'green' : 'gray'}>
                {patient.status}
              </Badge>
              <Text size="sm" c="dimmed">
                Patient ID: {patient.id}
              </Text>
            </Group>
          </Stack>
        </Group>

        <Grid>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Personal Information</Text>
              <Text size="sm">
                <strong>Age:</strong> {calculateAge(patient.dateOfBirth)}
              </Text>
              <Text size="sm">
                <strong>Gender:</strong> {patient.gender}
              </Text>
              <Text size="sm">
                <strong>Date of Birth:</strong> {patient.dateOfBirth}
              </Text>
              <Text size="sm">
                <strong>ID:</strong> {patient.id}
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Contact Information</Text>
              <Text size="sm">
                <strong>Phone:</strong> {patient.phone}
              </Text>
              <Text size="sm">
                <strong>Email:</strong> {patient.email}
              </Text>
              <Text size="sm">
                <strong>Address:</strong><br />
                {typeof patient.address === 'object' ? (
                  <>
                    {patient.address.street}<br />
                    {patient.address.city}, {patient.address.state} {patient.address.zipCode}
                  </>
                ) : (
                  patient.address
                )}
              </Text>
            </Stack>
          </Grid.Col>
        </Grid>

        {patient.insurance && (
          <Stack gap="xs">
            <Text fw={500}>Insurance Information</Text>
            {typeof patient.insurance === 'object' ? (
              <>
                <Text size="sm">
                  <strong>Provider:</strong> {patient.insurance.provider}
                </Text>
                <Text size="sm">
                  <strong>Policy Number:</strong> {patient.insurance.policyNumber}
                </Text>
                <Text size="sm">
                  <strong>Group Number:</strong> {patient.insurance.groupNumber}
                </Text>
              </>
            ) : (
              <Text size="sm">{patient.insurance}</Text>
            )}
          </Stack>
        )}

        <Stack gap="xs">
          <Text fw={500}>Medical Information</Text>
          <Text size="sm">
            <strong>Emergency Contact:</strong> {patient.emergencyContact}
          </Text>
          <Text size="sm">
            <strong>Last Visit:</strong> {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'Never'}
          </Text>
        </Stack>

        <Stack gap="xs">
          <Text fw={500}>Products & Subscriptions</Text>
          {/* Mock subscription data for demonstration */}
          <Card withBorder p="sm" radius="sm">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={500}>Semaglutide (Ozempic) - Weekly</Text>
                <Badge color="green" size="sm">Active</Badge>
              </Group>
              <Text size="xs" c="dimmed">
                <strong>Started:</strong> {new Date('2024-01-15').toLocaleDateString()}
              </Text>
              <Text size="xs" c="dimmed">
                <strong>Next Billing:</strong> {new Date('2024-02-15').toLocaleDateString()}
              </Text>
              <Text size="xs" c="dimmed">
                <strong>Monthly Cost:</strong> $299/month
              </Text>
            </Stack>
          </Card>
          
          <Card withBorder p="sm" radius="sm">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={500}>Monthly Consultation Plan</Text>
                <Badge color="blue" size="sm">Active</Badge>
              </Group>
              <Text size="xs" c="dimmed">
                <strong>Started:</strong> {new Date('2024-01-10').toLocaleDateString()}
              </Text>
              <Text size="xs" c="dimmed">
                <strong>Next Billing:</strong> {new Date('2024-02-10').toLocaleDateString()}
              </Text>
              <Text size="xs" c="dimmed">
                <strong>Monthly Cost:</strong> $149/month
              </Text>
            </Stack>
          </Card>

          <Card withBorder p="sm" radius="sm">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={500}>Health Monitoring Package</Text>
                <Badge color="orange" size="sm">Paused</Badge>
              </Group>
              <Text size="xs" c="dimmed">
                <strong>Started:</strong> {new Date('2023-12-01').toLocaleDateString()}
              </Text>
              <Text size="xs" c="dimmed">
                <strong>Paused Since:</strong> {new Date('2024-01-20').toLocaleDateString()}
              </Text>
              <Text size="xs" c="dimmed">
                <strong>Monthly Cost:</strong> $79/month
              </Text>
            </Stack>
          </Card>
        </Stack>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
          <Button>Edit Patient</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Main Patients Page Component
 */
export const PatientsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);

  const { data: patients, isLoading, error } = usePatients({
    search: searchQuery,
    status: statusFilter,
    page: currentPage,
    limit: 12,
  });

  // Debug logging
  console.log('PatientsPage - patients data:', patients);
  console.log('PatientsPage - isLoading:', isLoading);
  console.log('PatientsPage - error:', error);

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    openDetails();
  };

  const handleEditPatient = (patient: Patient) => {
    setEditPatient(patient);
    openEditModal();
  };

  const handleCreatePatient = () => {
    openCreateModal();
  };
  const filteredPatients = patients?.data || [];
  const totalPages = Math.ceil((patients?.total || 0) / 12);

  if (error) {
    return (
      <Container size="xl" py="md">
        <Text color="red">Error loading patients: {error.message}</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Patients</Title>
            <Text c="dimmed">Manage patient records and information</Text>
          </div>
          <Button leftSection={<Plus size={16} />} onClick={handleCreatePatient}>
            Add New Patient
          </Button>
        </Group>

        {/* Filters and Search */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Grid align="end">
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <TextInput
                placeholder="Search patients..."
                leftSection={<Search size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                placeholder="Filter by status"
                leftSection={<Filter size={16} />}
                data={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Group justify="flex-end">
                <Button.Group>
                  <Button
                    variant={viewMode === 'cards' ? 'filled' : 'light'}
                    onClick={() => setViewMode('cards')}
                  >
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'filled' : 'light'}
                    onClick={() => setViewMode('table')}
                  >
                    Table
                  </Button>
                </Button.Group>
              </Group>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Center py="xl">
            <Loader size="lg" />
          </Center>
        )}

        {/* Patients Display */}
        {!isLoading && (
          <>
            {viewMode === 'cards' ? (
              <Grid>
                {filteredPatients.map((patient) => (
                  <Grid.Col key={patient.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <PatientCard
                      patient={patient}
                      onView={handleViewPatient}
                      onEdit={handleEditPatient}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            ) : (
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Age</Table.Th>
                      <Table.Th>Phone</Table.Th>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Last Visit</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredPatients.map((patient) => (
                      <Table.Tr key={patient.id}>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar size="sm" radius="xl" color="blue">
                              {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                            </Avatar>
                            <Text size="sm" fw={500}>
                              {patient.firstName} {patient.lastName}
                            </Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{patient.phone}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{patient.email}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={patient.status === 'active' ? 'green' : 'gray'} size="sm">
                            {patient.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'Never'}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="light"
                              color="blue"
                              size="sm"
                              onClick={() => handleViewPatient(patient)}
                            >
                              <Eye size={14} />
                            </ActionIcon>
                            <ActionIcon
                              variant="light"
                              color="orange"
                              size="sm"
                              onClick={() => handleEditPatient(patient)}
                            >
                              <Edit size={14} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Group justify="center">
                <Pagination
                  value={currentPage}
                  onChange={setCurrentPage}
                  total={totalPages}
                />
              </Group>
            )}

            {/* Empty State */}
            {filteredPatients.length === 0 && !isLoading && (
              <Center py="xl">
                <Stack align="center" gap="md">
                  <User size={48} color="gray" />
                  <Text size="lg" c="dimmed">
                    No patients found
                  </Text>
                  <Text size="sm" c="dimmed" ta="center">
                    {searchQuery || statusFilter
                      ? 'Try adjusting your search criteria'
                      : 'Get started by adding your first patient'}
                  </Text>
                  <Button leftSection={<Plus size={16} />} onClick={handleCreatePatient}>
                    Add New Patient
                  </Button>
                </Stack>
              </Center>
            )}
          </>
        )}
      </Stack>

      {/* Patient Details Modal */}
      <PatientDetailsModal
        patient={selectedPatient}
        opened={detailsOpened}
        onClose={closeDetails}
      />

      {/* Create Patient Modal */}
      <CreatePatientModal
        opened={createModalOpened}
        onClose={closeCreateModal}
      />

      {/* Edit Patient Modal */}
      <EditPatientModal
        opened={editModalOpened}
        onClose={closeEditModal}
        patient={editPatient}
      />
    </Container>
  );
};