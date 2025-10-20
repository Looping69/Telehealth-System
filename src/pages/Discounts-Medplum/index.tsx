/**
 * Discounts-Medplum Page Component
 * Manages discounts using FHIR data
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
  Progress,
  NumberFormatter,
} from '@mantine/core';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Percent,
  DollarSign,
  Calendar,
  Filter,
  Database,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { medplumClient } from '../../config/medplum';
import { ChargeItem } from '@medplum/fhirtypes';

/**
 * FHIR Discount Card Component
 */
interface FHIRDiscountCardProps {
  chargeItem: ChargeItem;
  onView: (chargeItem: ChargeItem) => void;
  onEdit: (chargeItem: ChargeItem) => void;
}

const FHIRDiscountCard: React.FC<FHIRDiscountCardProps> = ({ chargeItem, onView, onEdit }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'retired':
        return 'red';
      case 'draft':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getDiscountName = () => {
    return chargeItem.code?.text || 
           chargeItem.code?.coding?.[0]?.display || 
           'Unnamed Discount';
  };

  const getDiscountAmount = () => {
    // ChargeItem doesn't have priceComponent in FHIR R4, using extension or other fields
    const extension = chargeItem.extension?.find(ext => ext.url?.includes('amount'));
    if (extension?.valueDecimal) {
      return extension.valueDecimal;
    }
    return 0;
  };

  const getDiscountType = () => {
    // Use code or category for discount type
    return chargeItem.code?.coding?.[0]?.display || 'discount';
  };

  const getDiscountPercentage = () => {
    // Use extension for percentage or calculate from amount
    const extension = chargeItem.extension?.find(ext => ext.url?.includes('percentage'));
    if (extension?.valueDecimal) {
      return Math.round(extension.valueDecimal);
    }
    return 10; // Default percentage
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Badge size="xs" color="green" variant="light">
              <Database size={10} style={{ marginRight: 4 }} />
              FHIR ChargeItem
            </Badge>
          </Group>
          <Badge color={getStatusColor(chargeItem.status)}>
            {chargeItem.status}
          </Badge>
        </Group>

        <Group>
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            backgroundColor: '#FF6B6B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Percent size={20} color="white" />
          </div>
          <Stack gap={4}>
            <Text fw={500}>{getDiscountName()}</Text>
            <Text size="sm" c="dimmed">
              {chargeItem.definitionUri?.[0] || chargeItem.code?.text || 'No description'}
            </Text>
          </Stack>
        </Group>

        <Stack gap="xs">
          <Group gap="xs">
            <DollarSign size={14} />
            <Text size="sm">Amount: {formatCurrency(getDiscountAmount())}</Text>
          </Group>
          <Group gap="xs">
            <Percent size={14} />
            <Text size="sm">Discount: {getDiscountPercentage()}%</Text>
          </Group>
          <Group gap="xs">
            <Tag size={14} />
            <Text size="sm">Type: {getDiscountType()}</Text>
          </Group>
        </Stack>

        {getDiscountPercentage() > 0 && (
          <div>
            <Group justify="space-between" mb="xs">
              <Text size="sm">Discount Rate</Text>
              <Text size="sm">{getDiscountPercentage()}%</Text>
            </Group>
            <Progress value={getDiscountPercentage()} color="red" size="sm" />
          </div>
        )}

        <Group justify="space-between" align="center">
          <Text size="sm" fw={500}>
            ID: {chargeItem.id}
          </Text>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => onView(chargeItem)}
            >
              <Eye size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => onEdit(chargeItem)}
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
 * Main Discounts-Medplum Page Component
 */
const DiscountsMedplumPage: React.FC = () => {
  const [chargeItems, setChargeItems] = useState<ChargeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChargeItem, setSelectedChargeItem] = useState<ChargeItem | null>(null);

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // Fetch FHIR charge items (used as discounts)
  useEffect(() => {
    const fetchChargeItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await medplumClient.search('ChargeItem', {
          _sort: '-_lastUpdated',
          _count: '50'
        });

        if (response.entry) {
          const chargeItemData = response.entry
            .filter(entry => entry.resource?.resourceType === 'ChargeItem')
            .map(entry => entry.resource as ChargeItem);
          
          setChargeItems(chargeItemData);
        } else {
          setChargeItems([]);
        }
      } catch (err) {
        console.error('Error fetching FHIR charge items:', err);
        setError('Failed to fetch discounts from FHIR server. Please check your connection.');
        setChargeItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChargeItems();
  }, []);

  // Filter charge items
  const filteredChargeItems = useMemo(() => {
    return chargeItems.filter(chargeItem => {
      const matchesSearch = !searchTerm || 
        chargeItem.code?.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chargeItem.code?.coding?.[0]?.display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chargeItem.id?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [chargeItems, searchTerm]);

  const handleViewChargeItem = (chargeItem: ChargeItem) => {
    setSelectedChargeItem(chargeItem);
    openDetails();
  };

  const handleEditChargeItem = (chargeItem: ChargeItem) => {
    setSelectedChargeItem(chargeItem);
    openEdit();
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading FHIR charge items...</Text>
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
            <Title order={1}>Discounts</Title>
            <Group gap="xs">
              <Badge color="green" variant="light">
                <Database size={12} style={{ marginRight: 4 }} />
                Live FHIR Data
              </Badge>
              <Text c="dimmed">Manage discounts and pricing adjustments</Text>
            </Group>
          </Stack>
          <Button leftSection={<Plus size={16} />} onClick={openCreate}>
            Create Discount
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
                placeholder="Search discounts..."
                leftSection={<Search size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Text size="sm" c="dimmed">
                {filteredChargeItems.length} discounts
              </Text>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Discounts Grid */}
        {filteredChargeItems.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Percent size={48} color="gray" />
              <Text size="lg" c="dimmed">No discounts found</Text>
              <Text size="sm" c="dimmed">
                {error ? 'Check your FHIR server connection' : 'Try adjusting your search or create new discounts'}
              </Text>
            </Stack>
          </Center>
        ) : (
          <Grid>
            {filteredChargeItems.map((chargeItem) => (
              <Grid.Col key={chargeItem.id} span={{ base: 12, md: 6, lg: 4 }}>
                <FHIRDiscountCard
                  chargeItem={chargeItem}
                  onView={handleViewChargeItem}
                  onEdit={handleEditChargeItem}
                />
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Discount Details Modal */}
        <Modal
          opened={detailsOpened}
          onClose={closeDetails}
          title={`FHIR ChargeItem #${selectedChargeItem?.id}`}
          size="lg"
        >
          {selectedChargeItem && (
            <Stack gap="md">
              <Alert icon={<Database size={16} />} color="green" variant="light">
                Live FHIR Data - ChargeItem ID: {selectedChargeItem.id}
              </Alert>
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Name</Text>
                    <Text size="sm" c="dimmed">
                      {selectedChargeItem.code?.text || 'Unknown'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Status</Text>
                    <Badge color={selectedChargeItem.status === 'billable' ? 'green' : 'yellow'}>
                      {selectedChargeItem.status || 'unknown'}
                    </Badge>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Amount</Text>
                    <Text size="sm" c="dimmed">
                      <NumberFormatter
                        value={(selectedChargeItem as any).priceComponent?.[0]?.amount?.value || 0}
                        prefix="$"
                        thousandSeparator
                        decimalScale={2}
                      />
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Type</Text>
                    <Text size="sm" c="dimmed">
                      {(selectedChargeItem as any).priceComponent?.[0]?.type || 'base'}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Definition</Text>
                    <Text size="sm" c="dimmed">
                      {selectedChargeItem.definitionUri?.[0] || 'No definition available'}
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
          )}
        </Modal>

        {/* Create and Edit Modals */}
        <Modal
          opened={createOpened}
          onClose={closeCreate}
          title="Create New FHIR Discount"
          size="lg"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR discount creation requires specific implementation for ChargeItem resources.
          </Alert>
        </Modal>

        <Modal
          opened={editOpened}
          onClose={closeEdit}
          title="Edit FHIR Discount"
          size="lg"
        >
          <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
            FHIR discount editing requires specific implementation for the selected ChargeItem resource.
          </Alert>
        </Modal>
      </Stack>
    </Container>
  );
};

export default DiscountsMedplumPage;