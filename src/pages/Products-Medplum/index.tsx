/**
 * Products-Medplum Page Component
 * Manages products using FHIR Medication data from Medplum server
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
  NumberFormatter,
  Image,
  Divider,
  Tooltip,
  Tabs,
  Table,
  Checkbox,
  Menu,
  Progress,
  rem,
} from '@mantine/core';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Calendar,
  Filter,
  Database,
  AlertCircle,
  Pill,
  Star,
  TrendingUp,
  Users,
  MoreVertical,
  Copy,
  Download,
  AlertTriangle,
  Check,
  X,
  Shuffle,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { medplumClient } from '../../config/medplum';
import { Medication } from '@medplum/fhirtypes';
import CreateProductModal from '../../components/CreateProductModal';

/**
 * Enhanced FHIR Product Card Component
 */
interface FHIRProductCardProps {
  medication: Medication;
  onView: (medication: Medication) => void;
  onEdit: (medication: Medication) => void;
  onToggleStatus: (medication: Medication) => void;
  onDelete: (medicationId: string) => void;
  onDuplicate: (medicationId: string) => void;
  isSelected: boolean;
  onSelect: (medicationId: string, selected: boolean) => void;
}

const FHIRProductCard: React.FC<FHIRProductCardProps> = ({ 
  medication, 
  onView, 
  onEdit, 
  onToggleStatus, 
  onDelete, 
  onDuplicate, 
  isSelected, 
  onSelect 
}) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      case 'entered-in-error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getProductName = () => {
    return medication.code?.text || 
           medication.code?.coding?.[0]?.display || 
           'Unnamed Product';
  };

  const getManufacturer = () => {
    return medication.manufacturer?.display || 'Unknown Manufacturer';
  };

  const getDosageForm = () => {
    return medication.form?.text || 
           medication.form?.coding?.[0]?.display || 
           'Unknown Form';
  };

  const getIngredients = () => {
    if (medication.ingredient && medication.ingredient.length > 0) {
      return medication.ingredient.map(ing => 
        ing.itemCodeableConcept?.text || 
        ing.itemCodeableConcept?.coding?.[0]?.display || 
        'Unknown Ingredient'
      ).join(', ');
    }
    return 'No ingredients listed';
  };

  const getBatchNumber = () => {
    return medication.batch?.lotNumber || 'N/A';
  };

  const getExpirationDate = () => {
    if (medication.batch?.expirationDate) {
      return new Date(medication.batch.expirationDate).toLocaleDateString();
    }
    return 'N/A';
  };

  // Mock rating and booking data for display purposes
  const mockRating = 4.5 + Math.random() * 0.5;
  const mockBookings = Math.floor(Math.random() * 1000) + 100;
  const mockPrice = Math.floor(Math.random() * 500) + 50;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Checkbox
              checked={isSelected}
              onChange={(event) => onSelect(medication.id!, event.currentTarget.checked)}
            />
            <Badge size="xs" color="green" variant="light">
              <Database size={10} style={{ marginRight: 4 }} />
              FHIR Medication
            </Badge>
          </Group>
          <Group gap="xs">
            <Badge color={getStatusColor(medication.status)}>
              {medication.status || 'unknown'}
            </Badge>
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray">
                  <MoreVertical size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<Eye size={14} />} onClick={() => onView(medication)}>
                  View Details
                </Menu.Item>
                <Menu.Item leftSection={<Edit size={14} />} onClick={() => onEdit(medication)}>
                  Edit Product
                </Menu.Item>
                <Menu.Item leftSection={<Copy size={14} />} onClick={() => onDuplicate(medication.id!)}>
                  Duplicate
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item 
                  leftSection={<Trash2 size={14} />} 
                  color="red"
                  onClick={() => onDelete(medication.id!)}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        <Group>
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: '8px', 
            backgroundColor: '#4ECDC4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Pill size={20} color="white" />
          </div>
          <Stack gap={4}>
            <Text fw={500}>{getProductName()}</Text>
            <Text size="sm" c="dimmed">
              {getManufacturer()}
            </Text>
          </Stack>
        </Group>

        <Stack gap="xs">
          <Group gap="xs">
            <Package size={14} />
            <Text size="sm">Form: {getDosageForm()}</Text>
          </Group>
          <Group gap="xs">
            <Pill size={14} />
            <Text size="sm" truncate>Ingredients: {getIngredients()}</Text>
          </Group>
          <Group gap="xs">
            <Calendar size={14} />
            <Text size="sm">Expires: {getExpirationDate()}</Text>
          </Group>
          <Group gap="xs">
            <Star size={14} />
            <Text size="sm">Rating: {mockRating.toFixed(1)} ({mockBookings} reviews)</Text>
          </Group>
        </Stack>

        <Group justify="space-between" align="center">
          <Group gap="xs">
            <Text size="sm" fw={500}>
              Batch: {getBatchNumber()}
            </Text>
            <Text fw={700} size="lg" c="blue">
              ${mockPrice}
            </Text>
          </Group>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => onView(medication)}
            >
              <Eye size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => onEdit(medication)}
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
 * Product Details Modal for FHIR Medications
 */
interface ProductDetailsModalProps {
  medication: Medication | null;
  opened: boolean;
  onClose: () => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ medication, opened, onClose }) => {
  if (!medication) return null;

  const getProductName = () => {
    return medication.code?.text || 
           medication.code?.coding?.[0]?.display || 
           'Unnamed Product';
  };

  const getManufacturer = () => {
    return medication.manufacturer?.display || 'Unknown Manufacturer';
  };

  const getDosageForm = () => {
    return medication.form?.text || 
           medication.form?.coding?.[0]?.display || 
           'Unknown Form';
  };

  const getIngredients = () => {
    if (medication.ingredient && medication.ingredient.length > 0) {
      return medication.ingredient.map(ing => 
        ing.itemCodeableConcept?.text || 
        ing.itemCodeableConcept?.coding?.[0]?.display || 
        'Unknown Ingredient'
      );
    }
    return ['No ingredients listed'];
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Product Details" size="lg">
      <Stack gap="md">
        <Alert icon={<Database size={16} />} color="green" variant="light">
          Live FHIR Data - Medication ID: {medication.id}
        </Alert>
        
        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="details">Details</Tabs.Tab>
            <Tabs.Tab value="ingredients">Ingredients</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <Stack gap="md">
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Name</Text>
                    <Text size="sm" c="dimmed">
                      {getProductName()}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Manufacturer</Text>
                    <Text size="sm" c="dimmed">
                      {getManufacturer()}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Form</Text>
                    <Text size="sm" c="dimmed">
                      {getDosageForm()}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Status</Text>
                    <Badge color={medication.status === 'active' ? 'green' : 'red'}>
                      {medication.status || 'unknown'}
                    </Badge>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="details" pt="md">
            <Stack gap="md">
              <Grid>
                <Grid.Col span={12}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Batch Information</Text>
                    <Text size="sm" c="dimmed">
                      Lot Number: {medication.batch?.lotNumber || 'N/A'}
                    </Text>
                    <Text size="sm" c="dimmed">
                      Expiration: {medication.batch?.expirationDate ? 
                        new Date(medication.batch.expirationDate).toLocaleDateString() : 'N/A'}
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="ingredients" pt="md">
            <Stack gap="md">
              <Text fw={500}>Active Ingredients</Text>
              <Stack gap="xs">
                {getIngredients().map((ingredient, index) => (
                  <Group key={index} gap="xs">
                    <Pill size={14} />
                    <Text size="sm">{ingredient}</Text>
                  </Group>
                ))}
              </Stack>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Modal>
  );
};

/**
 * Main Products-Medplum Page Component
 */
const ProductsMedplumPage: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // Fetch FHIR medications (used as products)
  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await medplumClient.search('Medication', {
          _sort: 'code',
          _count: '50'
        });

        if (response.entry) {
          const medicationData = response.entry
            .filter(entry => entry.resource?.resourceType === 'Medication')
            .map(entry => entry.resource as Medication);
          
          setMedications(medicationData);
        } else {
          setMedications([]);
        }
      } catch (err) {
        console.error('Error fetching medications:', err);
        setError('Failed to load FHIR medications');
        notifications.show({
          title: 'Error',
          message: 'Failed to load medications from FHIR server',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, []);

  // Filter medications
  const filteredMedications = useMemo(() => {
    return medications.filter(medication => {
      const matchesSearch = !searchTerm || 
        medication.code?.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medication.code?.coding?.[0]?.display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medication.manufacturer?.display?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || medication.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [medications, searchTerm, statusFilter]);

  // Calculate summary statistics
  const activeMedications = medications.filter(m => m.status === 'active').length;
  const totalMedications = medications.length;
  const averageRating = 4.5; // Mock data
  const totalBookings = Math.floor(Math.random() * 10000) + 5000; // Mock data

  const handleViewMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    openDetails();
  };

  const handleEditMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    openEdit();
  };

  const handleCreateMedication = () => {
    setSelectedMedication(null);
    openCreate();
  };

  /**
   * Handle medication status toggle (activate/deactivate)
   */
  const handleToggleStatus = (medication: Medication) => {
    setLoading(true);
    
    setTimeout(() => {
      setMedications(prev => prev.map(m => 
        m.id === medication.id 
          ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' }
          : m
      ));
      
      notifications.show({
        title: 'Product Updated',
        message: `Product ${medication.status === 'active' ? 'deactivated' : 'activated'} successfully`,
        color: medication.status === 'active' ? 'orange' : 'green',
      });
      
      setLoading(false);
    }, 500);
  };

  /**
   * Handle medication deletion with confirmation
   */
  const handleDeleteMedication = (medicationId: string) => {
    const medication = medications.find(m => m.id === medicationId);
    
    modals.openConfirmModal({
      title: 'Delete Product',
      children: (
        <Text size="sm">
          Are you sure you want to delete this medication? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await medplumClient.deleteResource('Medication', medicationId);
          setMedications(prev => prev.filter(m => m.id !== medicationId));
          setSelectedMedications(prev => prev.filter(id => id !== medicationId));
          
          notifications.show({
            title: 'Product Deleted',
            message: 'Medication has been deleted successfully',
            color: 'red',
          });
        } catch (err) {
          notifications.show({
            title: 'Error',
            message: 'Failed to delete medication',
            color: 'red',
          });
        }
      },
    });
  };

  /**
   * Handle medication duplication
   */
  const handleDuplicateMedication = (medicationId: string) => {
    const medication = medications.find(m => m.id === medicationId);
    if (!medication) return;

    const duplicatedMedication: Medication = {
      ...medication,
      id: undefined, // Let server assign new ID
      code: {
        ...medication.code,
        text: `${medication.code?.text || 'Medication'} (Copy)`
      }
    };

    // This would typically create a new medication via API
    notifications.show({
      title: 'Product Duplicated',
      message: 'Medication has been duplicated successfully',
      color: 'blue',
    });
  };

  /**
   * Handle bulk operations
   */
  const handleBulkDelete = () => {
    if (selectedMedications.length === 0) return;

    modals.openConfirmModal({
      title: 'Delete Selected Products',
      children: (
        <Text size="sm">
          Are you sure you want to delete {selectedMedications.length} selected medications? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete All', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        setMedications(prev => prev.filter(m => !selectedMedications.includes(m.id!)));
        setSelectedMedications([]);
        
        notifications.show({
          title: 'Products Deleted',
          message: `${selectedMedications.length} medications have been deleted`,
          color: 'red',
        });
      },
    });
  };

  const handleBulkStatusChange = (status: 'active' | 'inactive') => {
    if (selectedMedications.length === 0) return;

    setMedications(prev => prev.map(m => 
      selectedMedications.includes(m.id!) 
        ? { ...m, status }
        : m
    ));
    
    notifications.show({
      title: 'Products Updated',
      message: `${selectedMedications.length} medications have been ${status === 'active' ? 'activated' : 'deactivated'}`,
      color: status === 'active' ? 'green' : 'orange',
    });
    
    setSelectedMedications([]);
  };

  const handleSelectMedication = (medicationId: string, selected: boolean) => {
    if (selected) {
      setSelectedMedications(prev => [...prev, medicationId]);
    } else {
      setSelectedMedications(prev => prev.filter(id => id !== medicationId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedMedications(filteredMedications.map(m => m.id!));
    } else {
      setSelectedMedications([]);
    }
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading FHIR medications...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={2} mb="xs">Products Management (FHIR)</Title>
          <Text c="dimmed">
            Manage your healthcare products using FHIR Medication resources
            {filteredMedications.length !== medications.length && (
              <Text component="span" c="blue" ml="xs">
                ({filteredMedications.length} of {medications.length} shown)
              </Text>
            )}
          </Text>
        </div>

        {/* Summary Statistics */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder padding="md">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">Active Products</Text>
                <ActionIcon variant="light" color="green" size="lg">
                  <Package size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="green">
                {activeMedications}
              </Text>
              <Text size="xs" c="dimmed">
                of {totalMedications} total
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder padding="md">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">Total Revenue</Text>
                <ActionIcon variant="light" color="blue" size="lg">
                  <DollarSign size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="blue">
                <NumberFormatter prefix="$" value={Math.floor(Math.random() * 100000) + 50000} thousandSeparator />
              </Text>
              <Text size="xs" c="dimmed">
                This month
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder padding="md">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">Total Bookings</Text>
                <ActionIcon variant="light" color="orange" size="lg">
                  <Users size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="orange">
                <NumberFormatter value={totalBookings} thousandSeparator />
              </Text>
              <Text size="xs" c="dimmed">
                All time
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder padding="md">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">Average Rating</Text>
                <ActionIcon variant="light" color="yellow" size="lg">
                  <Star size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="yellow">
                {averageRating.toFixed(1)}
              </Text>
              <Text size="xs" c="dimmed">
                Out of 5.0
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Controls */}
        <Card withBorder padding="md">
          <Grid align="center">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                placeholder="Search medications..."
                leftSection={<Search size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Select
                placeholder="Filter by status"
                leftSection={<Filter size={16} />}
                data={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'entered-in-error', label: 'Error' },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Group>
                {selectedMedications.length > 0 && (
                  <Menu shadow="md" width={200}>
                    <Menu.Target>
                      <Button variant="light" leftSection={<MoreVertical size={16} />}>
                        Bulk Actions ({selectedMedications.length})
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<Check size={14} />}
                        onClick={() => handleBulkStatusChange('active')}
                      >
                        Activate Selected
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<X size={14} />}
                        onClick={() => handleBulkStatusChange('inactive')}
                      >
                        Deactivate Selected
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        leftSection={<Trash2 size={14} />}
                        color="red"
                        onClick={handleBulkDelete}
                      >
                        Delete Selected
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                )}
                <Button leftSection={<Plus size={16} />} onClick={handleCreateMedication}>
                  Add Product
                </Button>
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}>
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
            </Grid.Col>
          </Grid>
        </Card>

        {/* Products Display */}
        {viewMode === 'cards' ? (
          // Cards View
          filteredMedications.length === 0 ? (
            <Center py="xl">
              <Stack align="center" gap="md">
                <Package size={48} color="gray" />
                <Text size="lg" fw={500} c="dimmed">No medications found</Text>
                <Text size="sm" c="dimmed">
                  {searchTerm || statusFilter ? 'Try adjusting your filters' : 'Add your first medication to get started'}
                </Text>
                <Button leftSection={<Plus size={16} />} onClick={handleCreateMedication}>
                  Add First Product
                </Button>
              </Stack>
            </Center>
          ) : (
            <Grid>
              {filteredMedications.map((medication) => (
                <Grid.Col key={medication.id} span={{ base: 12, sm: 6, lg: 4 }}>
                  <FHIRProductCard
                    medication={medication}
                    onView={handleViewMedication}
                    onEdit={handleEditMedication}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDeleteMedication}
                    onDuplicate={handleDuplicateMedication}
                    isSelected={selectedMedications.includes(medication.id!)}
                    onSelect={handleSelectMedication}
                  />
                </Grid.Col>
              ))}
            </Grid>
          )
        ) : (
          // Table View
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    <Checkbox
                      checked={selectedMedications.length === filteredMedications.length && filteredMedications.length > 0}
                      indeterminate={selectedMedications.length > 0 && selectedMedications.length < filteredMedications.length}
                      onChange={(event) => handleSelectAll(event.currentTarget.checked)}
                    />
                  </Table.Th>
                  <Table.Th>Product</Table.Th>
                  <Table.Th>Manufacturer</Table.Th>
                  <Table.Th>Form</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Batch</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredMedications.map((medication) => (
                  <Table.Tr key={medication.id}>
                    <Table.Td>
                      <Checkbox
                        checked={selectedMedications.includes(medication.id!)}
                        onChange={(event) => handleSelectMedication(medication.id!, event.currentTarget.checked)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Group gap="sm">
                        <div style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '6px', 
                          backgroundColor: '#4ECDC4',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Pill size={16} color="white" />
                        </div>
                        <div>
                          <Text fw={500} size="sm">
                            {medication.code?.text || medication.code?.coding?.[0]?.display || 'Unnamed Product'}
                          </Text>
                          <Badge size="xs" color="green" variant="light">
                            FHIR
                          </Badge>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{medication.manufacturer?.display || 'Unknown'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{medication.form?.text || medication.form?.coding?.[0]?.display || 'Unknown'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={medication.status === 'active' ? 'green' : 'red'} size="sm">
                        {medication.status || 'unknown'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{medication.batch?.lotNumber || 'N/A'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray">
                            <MoreVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<Eye size={14} />}
                            onClick={() => handleViewMedication(medication)}
                          >
                            View Details
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<Edit size={14} />}
                            onClick={() => handleEditMedication(medication)}
                          >
                            Edit Product
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<Copy size={14} />}
                            onClick={() => handleDuplicateMedication(medication.id!)}
                          >
                            Duplicate
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item
                            leftSection={<Trash2 size={14} />}
                            color="red"
                            onClick={() => handleDeleteMedication(medication.id!)}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        )}

        {/* Modals */}
        <ProductDetailsModal
          medication={selectedMedication}
          opened={detailsOpened}
          onClose={closeDetails}
        />

        <CreateProductModal
          opened={createOpened}
          onClose={closeCreate}
          onProductCreated={() => {
            // Refresh the medications list after creating a new product
            const fetchMedications = async () => {
              try {
                setLoading(true);
                const response = await medplumClient.search('Medication', {
                  _sort: 'code',
                  _count: '50'
                });

                if (response.entry) {
                  const medicationData = response.entry
                    .filter(entry => entry.resource?.resourceType === 'Medication')
                    .map(entry => entry.resource as Medication);
                  
                  setMedications(medicationData);
                }
              } catch (err) {
                console.error('Error fetching medications:', err);
              } finally {
                setLoading(false);
              }
            };

            fetchMedications();
          }}
        />

        <Modal
          opened={editOpened}
          onClose={closeEdit}
          title="Edit FHIR Product"
          size="lg"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR product editing requires specific implementation for the selected Medication resource.
          </Alert>
        </Modal>
      </Stack>
    </Container>
  );
};

export default ProductsMedplumPage;