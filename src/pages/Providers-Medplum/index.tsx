/**
 * FHIR Providers Page - Medplum Integration
 * Displays healthcare providers from FHIR server with comprehensive UI
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Title,
  Text,
  Card,
  Grid,
  Group,
  Badge,
  Button,
  Stack,
  Avatar,
  ActionIcon,
  Modal,
  Alert,
  TextInput,
  Select,
  Center,
  Loader,
  Tabs,
  Textarea,
  NumberInput,
  Table,
  Checkbox,
  Switch,
  Divider,
  MultiSelect,
} from '@mantine/core';
import {
  Search,
  Plus,
  Eye,
  Edit,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Filter,
  Database,
  AlertCircle,
  Stethoscope,
  User,
  Calendar,
  Clock,
  Star,
  Award,
  Building,
  Users,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import { Practitioner } from '@medplum/fhirtypes';
import { backendFHIRService } from '../../services/backendFHIRService';

/**
 * Props for FHIR Practitioner Card component
 */
interface FHIRPractitionerCardProps {
  practitioner: Practitioner;
  onView: (practitioner: Practitioner) => void;
  onEdit: (practitioner: Practitioner) => void;
}

const FHIRPractitionerCard: React.FC<FHIRPractitionerCardProps> = ({ practitioner, onView, onEdit }) => {
  const getStatusColor = (active?: boolean) => {
    return active ? 'green' : 'red';
  };

  const getPractitionerName = () => {
    const name = practitioner.name?.[0];
    if (name) {
      const given = name.given?.join(' ') || '';
      const family = name.family || '';
      return `${given} ${family}`.trim() || 'Unknown Provider';
    }
    return 'Unknown Provider';
  };

  const getSpecialty = () => {
    return practitioner.qualification?.[0]?.code?.text || 'General Practice';
  };

  const getPhone = () => {
    const phone = practitioner.telecom?.find(t => t.system === 'phone');
    return phone?.value || 'Not provided';
  };

  const getEmail = () => {
    const email = practitioner.telecom?.find(t => t.system === 'email');
    return email?.value || 'Not provided';
  };

  const getAddress = () => {
    const address = practitioner.address?.[0];
    if (address) {
      const parts = [
        address.line?.join(' '),
        address.city,
        address.state,
        address.postalCode
      ].filter(Boolean);
      return parts.join(', ') || 'Address not provided';
    }
    return 'Address not provided';
  };

  // Mock data for demonstration - matching original styling
  const mockRating = 4.5 + Math.random() * 0.5;
  const mockPatients = Math.floor(Math.random() * 300) + 50;
  const mockYearsExperience = Math.floor(Math.random() * 20) + 5;
  const mockLanguages = ['English', 'Spanish', 'French'].slice(0, Math.floor(Math.random() * 3) + 1);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Avatar size="lg" radius="md" color="blue">
              <User size={24} />
            </Avatar>
            <Stack gap={4}>
              <Text fw={500} size="lg">
                Dr. {getPractitionerName()}
              </Text>
              <Text size="sm" c="dimmed">
                {getSpecialty()} • FHIR Provider
              </Text>
              <Group gap="xs">
                <Star size={14} fill="gold" color="gold" />
                <Text size="sm" fw={500}>
                  {mockRating.toFixed(1)}
                </Text>
                <Text size="sm" c="dimmed">
                  ({mockPatients} patients)
                </Text>
              </Group>
            </Stack>
          </Group>
          <Badge color={getStatusColor(practitioner.active)}>
            {practitioner.active ? 'active' : 'inactive'}
          </Badge>
        </Group>

        <Stack gap="xs">
          <Group gap="xs">
            <Stethoscope size={14} />
            <Text size="sm">
              {getSpecialty()}
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
            <Award size={14} />
            <Text size="sm">{mockYearsExperience} years experience</Text>
          </Group>
        </Stack>

        <Group justify="space-between" align="center">
          <Group gap="xs">
            {mockLanguages.slice(0, 2).map((lang) => (
              <Badge key={lang} size="sm" variant="light">
                {lang}
              </Badge>
            ))}
            {mockLanguages.length > 2 && (
              <Badge size="sm" variant="light">
                +{mockLanguages.length - 2}
              </Badge>
            )}
          </Group>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => onView(practitioner)}
            >
              <Eye size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => onEdit(practitioner)}
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
 * Props for FHIR Practitioner Table Row component
 */
interface FHIRPractitionerTableRowProps {
  practitioner: Practitioner;
  onView: (practitioner: Practitioner) => void;
  onEdit: (practitioner: Practitioner) => void;
}

const FHIRPractitionerTableRow: React.FC<FHIRPractitionerTableRowProps> = ({ practitioner, onView, onEdit }) => {
  const getPractitionerName = () => {
    const name = practitioner.name?.[0];
    if (name) {
      const given = name.given?.join(' ') || '';
      const family = name.family || '';
      return `${given} ${family}`.trim() || 'Unknown Provider';
    }
    return 'Unknown Provider';
  };

  const getSpecialty = () => {
    return practitioner.qualification?.[0]?.code?.text || 'General Practice';
  };

  const getDepartment = () => {
    return practitioner.qualification?.[0]?.code?.text || 'General Practice';
  };

  const getSpecialties = () => {
    const qualifications = practitioner.qualification || [];
    return qualifications.map(q => q.code?.text || 'General Practice');
  };

  // Mock data for demonstration
  const mockRating = 4.5 + Math.random() * 0.5;
  const mockPatients = Math.floor(Math.random() * 300) + 50;

  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="sm">
          <Avatar size="sm" radius="xl" color="blue">
            <User size={16} />
          </Avatar>
          <Stack gap={2}>
            <Text size="sm" fw={500}>
              Dr. {getPractitionerName()}
            </Text>
            <Text size="xs" c="dimmed">
              {getSpecialty()}
            </Text>
          </Stack>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{getDepartment()}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {getSpecialties().length > 2
            ? `${getSpecialties().slice(0, 2).join(', ')}...`
            : getSpecialties().join(', ')
          }
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge
          color={practitioner.active ? 'green' : 'red'}
          size="sm"
        >
          {practitioner.active ? 'active' : 'inactive'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Star size={14} fill="gold" color="gold" />
          <Text size="sm" fw={500}>
            {mockRating.toFixed(1)}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{mockPatients}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="light"
            color="blue"
            size="sm"
            onClick={() => onView(practitioner)}
          >
            <Eye size={14} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="orange"
            size="sm"
            onClick={() => onEdit(practitioner)}
          >
            <Edit size={14} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};

/**
 * Props for FHIR Practitioner Details Modal component
 */
interface FHIRPractitionerDetailsModalProps {
  practitioner: Practitioner | null;
  opened: boolean;
  onClose: () => void;
  onEdit?: (practitioner: Practitioner) => void;
}

const FHIRPractitionerDetailsModal: React.FC<FHIRPractitionerDetailsModalProps> = ({
  practitioner,
  opened,
  onClose,
  onEdit,
}) => {
  if (!practitioner) return null;

  const getPractitionerName = () => {
    const name = practitioner.name?.[0];
    if (name) {
      const given = name.given?.join(' ') || '';
      const family = name.family || '';
      return `${given} ${family}`.trim() || 'Unknown Provider';
    }
    return 'Unknown Provider';
  };

  const getPhone = () => {
    const phone = practitioner.telecom?.find(t => t.system === 'phone');
    return phone?.value || 'Not provided';
  };

  const getEmail = () => {
    const email = practitioner.telecom?.find(t => t.system === 'email');
    return email?.value || 'Not provided';
  };

  const getAddress = () => {
    const address = practitioner.address?.[0];
    if (address) {
      const parts = [
        address.line?.join(' '),
        address.city,
        address.state,
        address.postalCode
      ].filter(Boolean);
      return parts.join(', ') || 'Address not provided';
    }
    return 'Address not provided';
  };

  // Mock data for demonstration
  const mockRating = 4.5 + Math.random() * 0.5;
  const mockPatients = Math.floor(Math.random() * 300) + 50;
  const mockExperience = Math.floor(Math.random() * 20) + 5;
  const mockBio = "Dr. " + getPractitionerName() + " is a dedicated healthcare professional with extensive experience in their field. They are committed to providing high-quality patient care and staying current with the latest medical advances.";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Dr. ${getPractitionerName()}`}
      size="xl"
    >
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Avatar size="xl" radius="md" color="blue">
              <User size={32} />
            </Avatar>
            <Stack gap={4}>
              <Title order={3}>
                Dr. {getPractitionerName()}
              </Title>
              <Text c="dimmed">{practitioner.qualification?.[0]?.code?.text || 'General Practice'}</Text>
              <Group gap="xs">
                <Star size={16} fill="gold" color="gold" />
                <Text fw={500}>{mockRating.toFixed(1)}</Text>
                <Text c="dimmed">• {mockPatients} patients</Text>
              </Group>
            </Stack>
          </Group>
          <Badge size="lg" color={practitioner.active ? 'green' : 'red'}>
            {practitioner.active ? 'active' : 'inactive'}
          </Badge>
        </Group>

        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="credentials">Credentials</Tabs.Tab>
            <Tabs.Tab value="availability">Availability</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <Stack gap="md">
              <div>
                <Text fw={500} mb="xs">Biography</Text>
                <Text size="sm">{mockBio}</Text>
              </div>

              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text fw={500}>Contact Information</Text>
                    <Text size="sm">
                      <strong>Email:</strong> {getEmail()}
                    </Text>
                    <Text size="sm">
                      <strong>Phone:</strong> {getPhone()}
                    </Text>
                    <Text size="sm">
                      <strong>Address:</strong> {getAddress()}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text fw={500}>Professional Details</Text>
                    <Text size="sm">
                      <strong>Specialty:</strong> {practitioner.qualification?.[0]?.code?.text || 'General Practice'}
                    </Text>
                    <Text size="sm">
                      <strong>Experience:</strong> {mockExperience} years
                    </Text>
                    <Text size="sm">
                      <strong>Gender:</strong> {practitioner.gender || 'Not specified'}
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="credentials" pt="md">
            <Stack gap="md">
              <div>
                <Text fw={500} mb="xs">FHIR Information</Text>
                <Text size="sm">
                  <strong>Practitioner ID:</strong> {practitioner.id}
                </Text>
                <Text size="sm">
                  <strong>Active Status:</strong> {practitioner.active ? 'Active' : 'Inactive'}
                </Text>
              </div>

              <div>
                <Text fw={500} mb="xs">Qualifications</Text>
                <Stack gap="xs">
                  {practitioner.qualification?.map((qual, index) => (
                    <Text key={index} size="sm">• {qual.code?.text || 'General Practice'}</Text>
                  )) || <Text size="sm" c="dimmed">No qualifications specified</Text>}
                </Stack>
              </div>

              <div>
                <Text fw={500} mb="xs">Identifiers</Text>
                <Stack gap="xs">
                  {practitioner.identifier?.map((id, index) => (
                    <Text key={index} size="sm">• {id.system}: {id.value}</Text>
                  )) || <Text size="sm" c="dimmed">No identifiers specified</Text>}
                </Stack>
              </div>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="availability" pt="md">
            <Stack gap="md">
              <Text fw={500}>Weekly Schedule</Text>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Day</Table.Th>
                    <Table.Th>Available</Table.Th>
                    <Table.Th>Start Time</Table.Th>
                    <Table.Th>End Time</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => {
                    // Mock availability data
                    const isAvailable = index >= 1 && index <= 5; // Monday to Friday
                    return (
                      <Table.Tr key={day}>
                        <Table.Td style={{ textTransform: 'capitalize' }}>{day}</Table.Td>
                        <Table.Td>
                          <Badge color={isAvailable ? 'green' : 'red'} size="sm">
                            {isAvailable ? 'Available' : 'Not Available'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>{isAvailable ? '09:00' : '-'}</Table.Td>
                        <Table.Td>{isAvailable ? '17:00' : '-'}</Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button
              leftSection={<Edit size={16} />}
              onClick={() => {
                onEdit(practitioner);
                onClose();
              }}
            >
              Edit Provider
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Props for Create FHIR Practitioner Modal component
 */
interface CreateFHIRPractitionerModalProps {
  opened: boolean;
  onClose: () => void;
  onPractitionerCreated: (practitioner: Practitioner) => void;
}

const CreateFHIRPractitionerModal: React.FC<CreateFHIRPractitionerModalProps> = ({
  opened,
  onClose,
  onPractitionerCreated
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
    gender: '',
    active: true,
  });

  const handleSubmit = async () => {
    try {
      // Create FHIR Practitioner resource
      const newPractitioner: Practitioner = {
        resourceType: 'Practitioner',
        active: formData.active,
        name: [{
          given: [formData.firstName],
          family: formData.lastName,
        }],
        telecom: [
          {
            system: 'email',
            value: formData.email,
          },
          {
            system: 'phone',
            value: formData.phone,
          },
        ],
        gender: formData.gender as any,
        qualification: formData.specialty ? [{
          code: {
            text: formData.specialty,
          },
        }] : undefined,
      };

      const createdPractitioner = await backendFHIRService.createResource('Practitioner', newPractitioner);
      onPractitionerCreated(createdPractitioner);

      notifications.show({
        title: 'Success',
        message: 'FHIR Practitioner created successfully',
        color: 'green',
      });

      onClose();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialty: '',
        gender: '',
        active: true,
      });
    } catch (error) {
      console.error('Error creating practitioner:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create practitioner',
        color: 'red',
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create New FHIR Practitioner"
      size="lg"
    >
      <Stack gap="md">
        <Alert icon={<Database size={16} />} color="green" variant="light">
          Creating a new FHIR Practitioner resource on Medplum server
        </Alert>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="First Name"
              placeholder="Enter first name"
              required
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Last Name"
              placeholder="Enter last name"
              required
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Email"
              placeholder="Enter email address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Specialty"
              placeholder="Enter specialty"
              value={formData.specialty}
              onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Gender"
              placeholder="Select gender"
              data={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
                { value: 'unknown', label: 'Unknown' },
              ]}
              value={formData.gender}
              onChange={(value) => setFormData(prev => ({ ...prev, gender: value || '' }))}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Switch
              label="Active Status"
              description="Whether this practitioner is actively practicing"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.currentTarget.checked }))}
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.firstName || !formData.lastName || !formData.email}
          >
            Create Practitioner
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Props for Edit FHIR Practitioner Modal component
 */
interface EditFHIRPractitionerModalProps {
  practitioner: Practitioner | null;
  opened: boolean;
  onClose: () => void;
  onPractitionerUpdated: (practitioner: Practitioner) => void;
}

const EditFHIRPractitionerModal: React.FC<EditFHIRPractitionerModalProps> = ({
  practitioner,
  opened,
  onClose,
  onPractitionerUpdated
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
    gender: '',
    active: true,
  });

  useEffect(() => {
    if (practitioner) {
      const name = practitioner.name?.[0];
      const email = practitioner.telecom?.find(t => t.system === 'email');
      const phone = practitioner.telecom?.find(t => t.system === 'phone');

      setFormData({
        firstName: name?.given?.[0] || '',
        lastName: name?.family || '',
        email: email?.value || '',
        phone: phone?.value || '',
        specialty: practitioner.qualification?.[0]?.code?.text || '',
        gender: practitioner.gender || '',
        active: practitioner.active ?? true,
      });
    }
  }, [practitioner]);

  const handleSubmit = async () => {
    if (!practitioner) return;

    try {
      // Update FHIR Practitioner resource
      const updatedPractitioner: Practitioner = {
        ...practitioner,
        active: formData.active,
        name: [{
          given: [formData.firstName],
          family: formData.lastName,
        }],
        telecom: [
          {
            system: 'email',
            value: formData.email,
          },
          {
            system: 'phone',
            value: formData.phone,
          },
        ],
        gender: formData.gender as any,
        qualification: formData.specialty ? [{
          code: {
            text: formData.specialty,
          },
        }] : undefined,
      };

      const result = await backendFHIRService.updateResource('Practitioner', practitioner.id!, updatedPractitioner);
      onPractitionerUpdated(result);

      notifications.show({
        title: 'Success',
        message: 'FHIR Practitioner updated successfully',
        color: 'green',
      });
      onClose();
    } catch (error) {
      console.error('Error updating practitioner:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update practitioner',
        color: 'red',
      });
    }
  };

  if (!practitioner) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Edit FHIR Practitioner - ${practitioner.id}`}
      size="lg"
    >
      <Stack gap="md">
        <Alert icon={<Database size={16} />} color="blue" variant="light">
          Editing FHIR Practitioner resource: {practitioner.id}
        </Alert>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="First Name"
              placeholder="Enter first name"
              required
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Last Name"
              placeholder="Enter last name"
              required
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Email"
              placeholder="Enter email address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Specialty"
              placeholder="Enter specialty"
              value={formData.specialty}
              onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Gender"
              placeholder="Select gender"
              data={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
                { value: 'unknown', label: 'Unknown' },
              ]}
              value={formData.gender}
              onChange={(value) => setFormData(prev => ({ ...prev, gender: value || '' }))}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Switch
              label="Active Status"
              description="Whether this practitioner is actively practicing"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.currentTarget.checked }))}
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.firstName || !formData.lastName || !formData.email}
          >
            Update Practitioner
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Main Providers-Medplum Page Component
 */
const ProvidersMedplumPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | null>(null);

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // Fetch FHIR practitioners
  const fetchPractitioners = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await backendFHIRService.searchResources('Practitioner', {
        _sort: 'name',
        _count: '50'
      });

      const practitionerData = (response?.data ?? []) as Practitioner[];
      setPractitioners(practitionerData);
    } catch (err) {
      console.error('Error fetching FHIR practitioners:', err);
      setError('Failed to fetch providers from FHIR server. Please check your connection.');
      setPractitioners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPractitioners();
  }, []);

  // Handler functions
  const handleViewPractitioner = (practitioner: Practitioner) => {
    setSelectedPractitioner(practitioner);
    openDetails();
  };

  const handleEditPractitioner = (practitioner: Practitioner) => {
    setSelectedPractitioner(practitioner);
    openEdit();
  };

  const handlePractitionerCreated = (practitioner: Practitioner) => {
    setPractitioners(prev => [...prev, practitioner]);
    notifications.show({
      title: 'Success',
      message: 'Provider created successfully',
      color: 'green',
    });
  };

  const handlePractitionerUpdated = (practitioner: Practitioner) => {
    setPractitioners(prev =>
      prev.map(p => p.id === practitioner.id ? practitioner : p)
    );
    notifications.show({
      title: 'Success',
      message: 'Provider updated successfully',
      color: 'green',
    });
  };

  // Filter practitioners
  const filteredPractitioners = useMemo(() => {
    return practitioners.filter(practitioner => {
      const name = practitioner.name?.[0];
      const fullName = name ? `${name.given?.join(' ')} ${name.family}`.toLowerCase() : '';
      const specialty = practitioner.qualification?.[0]?.code?.text?.toLowerCase() || '';

      const matchesSearch = !searchQuery ||
        fullName.includes(searchQuery.toLowerCase()) ||
        specialty.includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter ||
        (statusFilter === 'active' && practitioner.active) ||
        (statusFilter === 'inactive' && !practitioner.active);

      const matchesDepartment = !departmentFilter ||
        (practitioner.qualification?.[0]?.code?.text || 'General Practice') === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [practitioners, searchQuery, statusFilter, departmentFilter]);

  // Calculate summary statistics
  const activePractitioners = practitioners.filter(p => p.active).length;
  const totalPatients = practitioners.reduce((sum, p) => {
    // Mock patient count for each practitioner
    return sum + (Math.floor(Math.random() * 300) + 50);
  }, 0);
  const avgRating = 4.5 + Math.random() * 0.5; // Mock average rating
  const departments = Array.from(new Set(
    practitioners.map(p => p.qualification?.[0]?.code?.text || 'General Practice')
  )).length;

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading FHIR practitioners...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <Stack gap="xs">
            <Title order={2}>Healthcare Providers</Title>
            <Text c="dimmed" size="sm" style={{ display: 'flex', alignItems: 'center' }}>
              <Database size={12} style={{ marginRight: 4 }} />
              FHIR-powered provider management with real-time data
            </Text>
          </Stack>
          <Button leftSection={<Plus size={16} />} onClick={openCreate}>
            Add Provider
          </Button>
        </Group>

        {/* Summary Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Active Providers
                </Text>
                <ActionIcon variant="light" color="green" size="lg">
                  <UserCheck size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="green">
                {activePractitioners}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Total Patients
                </Text>
                <ActionIcon variant="light" color="blue" size="lg">
                  <Users size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="blue">
                {totalPatients}
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
                  Departments
                </Text>
                <ActionIcon variant="light" color="indigo" size="lg">
                  <Building size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="indigo">
                {departments}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Error Alert */}
        {error && (
          <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <TextInput
              placeholder="Search providers..."
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
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Select
              placeholder="Filter by department"
              leftSection={<Building size={16} />}
              data={Array.from(new Set(
                practitioners.map(p => p.qualification?.[0]?.code?.text || 'General Practice')
              )).map(dept => ({ value: dept, label: dept }))}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Group>
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
            </Group>
          </Grid.Col>
        </Grid>

        {/* Providers Display */}
        {loading ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Loader size="lg" />
              <Text>Loading providers...</Text>
            </Stack>
          </Center>
        ) : (
          <>
            {viewMode === 'cards' ? (
              <Grid>
                {filteredPractitioners.map((practitioner) => (
                  <Grid.Col key={practitioner.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <FHIRPractitionerCard
                      practitioner={practitioner}
                      onView={handleViewPractitioner}
                      onEdit={handleEditPractitioner}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Provider</Table.Th>
                    <Table.Th>Department</Table.Th>
                    <Table.Th>Specialties</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Rating</Table.Th>
                    <Table.Th>Patients</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredPractitioners.map((practitioner) => (
                    <FHIRPractitionerTableRow
                      key={practitioner.id}
                      practitioner={practitioner}
                      onView={handleViewPractitioner}
                      onEdit={handleEditPractitioner}
                    />
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && filteredPractitioners.length === 0 && (
          <Center py="xl">
            <Stack align="center" gap="md">
              <User size={48} color="gray" />
              <Text size="lg" c="dimmed">
                No providers found
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                {searchQuery || statusFilter || departmentFilter
                  ? 'Try adjusting your search criteria'
                  : 'Get started by adding your first healthcare provider'}
              </Text>
              <Button leftSection={<Plus size={16} />} onClick={openCreate}>
                Add Provider
              </Button>
            </Stack>
          </Center>
        )}

        {/* Provider Details Modal */}
        <FHIRPractitionerDetailsModal
          practitioner={selectedPractitioner}
          opened={detailsOpened}
          onClose={closeDetails}
          onEdit={handleEditPractitioner}
        />

        {/* Create Provider Modal */}
        <CreateFHIRPractitionerModal
          opened={createOpened}
          onClose={closeCreate}
          onPractitionerCreated={handlePractitionerCreated}
        />

        {/* Edit Provider Modal */}
        <EditFHIRPractitionerModal
          practitioner={selectedPractitioner}
          opened={editOpened}
          onClose={closeEdit}
          onPractitionerUpdated={handlePractitionerUpdated}
        />
      </Stack>
    </Container>
  );
};

export default ProvidersMedplumPage;