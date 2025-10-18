/**
 * Products-Medplum Page Component
 * Manages products using FHIR data
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
  ActionIcon,
  Modal,
  Center,
  Loader,
  Alert,
  NumberFormatter,
  Image,
} from '@mantine/core';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Package,
  DollarSign,
  Calendar,
  Filter,
  Database,
  AlertCircle,
  Pill,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { medplumClient } from '../../config/medplum';
import { Medication } from '@medplum/fhirtypes';
import CreateProductModal from '../../components/CreateProductModal';

/**
 * FHIR Product Card Component
 */
interface FHIRProductCardProps {
  medication: Medication;
  onView: (medication: Medication) => void;
  onEdit: (medication: Medication) => void;
}

const FHIRProductCard: React.FC<FHIRProductCardProps> = ({ medication, onView, onEdit }) => {
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

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Badge size="xs" color="green" variant="light">
              <Database size={10} style={{ marginRight: 4 }} />
              FHIR Medication
            </Badge>
          </Group>
          <Badge color={getStatusColor(medication.status)}>
            {medication.status}
          </Badge>
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
        </Stack>

        <Group justify="space-between" align="center">
          <Text size="sm" fw={500}>
            Batch: {getBatchNumber()}
          </Text>
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
 * Main Products-Medplum Page Component
 */
const ProductsMedplumPage: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);

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
        console.error('Error fetching FHIR medications:', err);
        setError('Failed to fetch products from FHIR server. Please check your connection.');
        setMedications([]);
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
        medication.manufacturer?.display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medication.id?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [medications, searchTerm]);

  const handleViewMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    openDetails();
  };

  const handleEditMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    openEdit();
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

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Title order={1}>Products</Title>
            <Group gap="xs">
              <Badge color="green" variant="light">
                <Database size={12} style={{ marginRight: 4 }} />
                Live FHIR Data
              </Badge>
              <Text c="dimmed">Manage medications and pharmaceutical products</Text>
            </Group>
          </Stack>
          <Button leftSection={<Plus size={16} />} onClick={openCreate}>
            Add Product
          </Button>
        </Group>

        {/* Error Alert */}
        {error && (
          <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        )}

        {/* Search */}
        <Card withBorder padding="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <TextInput
                placeholder="Search products..."
                leftSection={<Search size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Text size="sm" c="dimmed">
                {filteredMedications.length} products
              </Text>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Products Grid */}
        {filteredMedications.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Package size={48} color="gray" />
              <Text size="lg" c="dimmed">No products found</Text>
              <Text size="sm" c="dimmed">
                {error ? 'Check your FHIR server connection' : 'Try adjusting your search or add new products'}
              </Text>
            </Stack>
          </Center>
        ) : (
          <Grid>
            {filteredMedications.map((medication) => (
              <Grid.Col key={medication.id} span={{ base: 12, md: 6, lg: 4 }}>
                <FHIRProductCard
                  medication={medication}
                  onView={handleViewMedication}
                  onEdit={handleEditMedication}
                />
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Product Details Modal */}
        <Modal
          opened={detailsOpened}
          onClose={closeDetails}
          title={`FHIR Medication #${selectedMedication?.id}`}
          size="lg"
        >
          {selectedMedication && (
            <Stack gap="md">
              <Alert icon={<Database size={16} />} color="green" variant="light">
                Live FHIR Data - Medication ID: {selectedMedication.id}
              </Alert>
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Name</Text>
                    <Text size="sm" c="dimmed">
                      {selectedMedication.code?.text || 'Unknown'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Status</Text>
                    <Badge color={selectedMedication.status === 'active' ? 'green' : 'red'}>
                      {selectedMedication.status}
                    </Badge>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Manufacturer</Text>
                    <Text size="sm" c="dimmed">
                      {selectedMedication.manufacturer?.display || 'Unknown'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Form</Text>
                    <Text size="sm" c="dimmed">
                      {selectedMedication.form?.text || 'Unknown'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Ingredients</Text>
                    <Text size="sm" c="dimmed">
                      {selectedMedication.ingredient?.map(ing => 
                        ing.itemCodeableConcept?.text || 
                        ing.itemCodeableConcept?.coding?.[0]?.display
                      ).join(', ') || 'No ingredients listed'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Batch Number</Text>
                    <Text size="sm" c="dimmed">
                      {selectedMedication.batch?.lotNumber || 'N/A'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Expiration Date</Text>
                    <Text size="sm" c="dimmed">
                      {selectedMedication.batch?.expirationDate ? 
                        new Date(selectedMedication.batch.expirationDate).toLocaleDateString() : 
                        'N/A'
                      }
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
          )}
        </Modal>

        {/* Create Product Modal */}
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
                console.error('Error refreshing medications:', err);
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