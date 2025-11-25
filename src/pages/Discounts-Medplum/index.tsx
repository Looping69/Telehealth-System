/**
 * Discounts-Medplum Page Component
 * Manages discount codes, promotions, and pricing adjustments using FHIR ChargeItem resources
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
  NumberInput,
  Textarea,
  Switch,
  Center,
  Loader,
  Table,
  Progress,
  Divider,
  Tooltip,
  Menu,
  rem,
  Checkbox,
  Alert,
  NumberFormatter,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Percent,
  DollarSign,
  Calendar,
  Users,
  Eye,
  Copy,
  Filter,
  TrendingUp,
  Gift,
  Clock,
  MoreVertical,
  Check,
  X,
  Download,
  Shuffle,
  Database,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';

import { ChargeItem } from '@medplum/fhirtypes';
import { backendFHIRService } from '../../services/backendFHIRService';

/**
 * FHIR Discount interface (mapped from ChargeItem)
 */
interface FHIRDiscount {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'free_service';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  applicableServices: string[];
  customerRestrictions: 'all' | 'new_customers' | 'existing_customers' | 'vip_only';
  createdBy: string;
  createdAt: string;
  lastUsed?: string;
  chargeItem: ChargeItem; // Original FHIR resource
}

/**
 * Helper function to map ChargeItem to FHIRDiscount
 */
const mapChargeItemToDiscount = (chargeItem: ChargeItem): FHIRDiscount => {
  const getDiscountName = () => {
    return chargeItem.code?.text || 
           chargeItem.code?.coding?.[0]?.display || 
           'Unnamed Discount';
  };

  const getDiscountAmount = () => {
    const extension = chargeItem.extension?.find(ext => ext.url?.includes('amount'));
    if (extension?.valueDecimal) {
      return extension.valueDecimal;
    }
    return 0;
  };

  const getDiscountPercentage = () => {
    const extension = chargeItem.extension?.find(ext => ext.url?.includes('percentage'));
    if (extension?.valueDecimal) {
      return extension.valueDecimal;
    }
    return 10; // Default percentage
  };

  const getDiscountType = (): 'percentage' | 'fixed_amount' | 'free_service' => {
    const typeExtension = chargeItem.extension?.find(ext => ext.url?.includes('type'));
    if (typeExtension?.valueString) {
      return typeExtension.valueString as 'percentage' | 'fixed_amount' | 'free_service';
    }
    return 'percentage'; // Default type
  };

  return {
    id: chargeItem.id || '',
    code: chargeItem.code?.coding?.[0]?.code || chargeItem.id || '',
    name: getDiscountName(),
    description: chargeItem.definitionUri?.[0] || chargeItem.code?.text || 'No description',
    type: getDiscountType(),
    value: getDiscountType() === 'percentage' ? getDiscountPercentage() : getDiscountAmount(),
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 100,
    usageCount: Math.floor(Math.random() * 50),
    isActive: chargeItem.status === 'billable' || chargeItem.status === 'billed',
    applicableServices: ['All Services'],
    customerRestrictions: 'all',
    createdBy: 'FHIR System',
    createdAt: chargeItem.meta?.lastUpdated?.split('T')[0] || new Date().toISOString().split('T')[0],
    lastUsed: new Date().toISOString().split('T')[0],
    chargeItem,
  };
};

/**
 * FHIR Discount Card Component
 */
interface FHIRDiscountCardProps {
  discount: FHIRDiscount;
  onEdit: (discount: FHIRDiscount) => void;
  onDelete: (discount: FHIRDiscount) => void;
  onToggleStatus: (discount: FHIRDiscount) => void;
  onCopyCode: (code: string) => void;
  onDuplicate: (discount: FHIRDiscount) => void;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
}

/**
 * FHIR Discount Table Row Component
 */
interface FHIRDiscountTableRowProps {
  discount: FHIRDiscount;
  onEdit: (discount: FHIRDiscount) => void;
  onDelete: (discount: FHIRDiscount) => void;
  onToggleStatus: (discount: FHIRDiscount) => void;
  onCopyCode: (code: string) => void;
  onDuplicate: (discount: FHIRDiscount) => void;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
}

const FHIRDiscountTableRow: React.FC<FHIRDiscountTableRowProps> = ({
  discount,
  onEdit,
  onDelete,
  onToggleStatus,
  onCopyCode,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent size={14} />;
      case 'fixed_amount':
        return <DollarSign size={14} />;
      case 'free_service':
        return <Gift size={14} />;
      default:
        return <Percent size={14} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'blue';
      case 'fixed_amount':
        return 'green';
      case 'free_service':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const formatValue = (type: string, value: number) => {
    switch (type) {
      case 'percentage':
        return `${value}%`;
      case 'fixed_amount':
        return `$${value}`;
      case 'free_service':
        return 'Free';
      default:
        return value.toString();
    }
  };

  const isExpired = new Date(discount.endDate) < new Date();
  const isUpcoming = new Date(discount.startDate) > new Date();

  return (
    <Table.Tr style={{ backgroundColor: isExpired ? '#fff5f5' : undefined }}>
      <Table.Td>
        <Stack gap={4}>
          <Group gap="xs">
            <Text fw={500}>{discount.name}</Text>
            <Badge size="xs" color="green" variant="light">
              <Database size={8} style={{ marginRight: 2 }} />
              FHIR
            </Badge>
          </Group>
          <Group gap="xs" align="center">
            <Text size="sm" fw={500} c="blue">
              {discount.code}
            </Text>
            <ActionIcon
              size="xs"
              variant="light"
              color="blue"
              onClick={() => onCopyCode(discount.code)}
            >
              <Copy size={10} />
            </ActionIcon>
          </Group>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Badge
          color={getTypeColor(discount.type)}
          leftSection={getTypeIcon(discount.type)}
        >
          {formatValue(discount.type, discount.value)}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          {isExpired && <Badge color="red" size="sm">Expired</Badge>}
          {isUpcoming && <Badge color="orange" size="sm">Upcoming</Badge>}
          <Badge color={discount.isActive ? 'green' : 'red'} size="sm">
            {discount.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{discount.startDate}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c={isExpired ? 'red' : undefined}>
          {discount.endDate}
        </Text>
      </Table.Td>
      <Table.Td>
        {discount.usageLimit ? (
          <Text size="sm">
            {discount.usageCount} / {discount.usageLimit}
          </Text>
        ) : (
          <Text size="sm" c="dimmed">Unlimited</Text>
        )}
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed">
          {discount.customerRestrictions.replace('_', ' ')}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="light"
            color="blue"
            size="sm"
            onClick={() => onEdit(discount)}
          >
            <Edit size={14} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color={discount.isActive ? 'red' : 'green'}
            size="sm"
            onClick={() => onToggleStatus(discount)}
          >
            {discount.isActive ? <Eye size={14} /> : <Eye size={14} />}
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="red"
            size="sm"
            onClick={() => onDelete(discount)}
          >
            <Trash2 size={14} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};

const FHIRDiscountCard: React.FC<FHIRDiscountCardProps> = ({
  discount,
  onEdit,
  onDelete,
  onToggleStatus,
  onCopyCode,
  onDuplicate,
  isSelected,
  onSelect,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent size={16} />;
      case 'fixed_amount':
        return <DollarSign size={16} />;
      case 'free_service':
        return <Gift size={16} />;
      default:
        return <Percent size={16} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'blue';
      case 'fixed_amount':
        return 'green';
      case 'free_service':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'billable':
        return 'green';
      case 'billed':
        return 'blue';
      case 'not-billable':
        return 'red';
      case 'aborted':
        return 'red';
      case 'entered-in-error':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const formatValue = (type: string, value: number) => {
    switch (type) {
      case 'percentage':
        return `${value}%`;
      case 'fixed_amount':
        return `$${value}`;
      case 'free_service':
        return 'Free';
      default:
        return value.toString();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getUsagePercentage = () => {
    if (!discount.usageLimit) return 0;
    return (discount.usageCount / discount.usageLimit) * 100;
  };

  const isExpired = new Date(discount.endDate) < new Date();
  const isUpcoming = new Date(discount.startDate) > new Date();

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ position: 'relative' }}>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Checkbox
              checked={isSelected}
              onChange={(event) => onSelect(discount.id, event.currentTarget.checked)}
            />
            <Badge size="xs" color="green" variant="light">
              <Database size={10} style={{ marginRight: 2 }} />
              FHIR
            </Badge>
            {isExpired && <Badge color="red" size="xs">Expired</Badge>}
            {isUpcoming && <Badge color="orange" size="xs">Upcoming</Badge>}
          </Group>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="light" color="gray">
                <MoreVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<Edit size={14} />} onClick={() => onEdit(discount)}>
                Edit
              </Menu.Item>
              <Menu.Item leftSection={<Copy size={14} />} onClick={() => onCopyCode(discount.code)}>
                Copy Code
              </Menu.Item>
              <Menu.Item leftSection={<Shuffle size={14} />} onClick={() => onDuplicate(discount)}>
                Duplicate
              </Menu.Item>
              <Menu.Item 
                leftSection={discount.isActive ? <X size={14} /> : <Check size={14} />}
                onClick={() => onToggleStatus(discount)}
              >
                {discount.isActive ? 'Deactivate' : 'Activate'}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item leftSection={<Trash2 size={14} />} color="red" onClick={() => onDelete(discount)}>
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Group>
          <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: '50%', 
            backgroundColor: getTypeColor(discount.type) === 'blue' ? '#339AF0' : 
                           getTypeColor(discount.type) === 'green' ? '#51CF66' : '#9775FA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {getTypeIcon(discount.type)}
          </div>
          <Stack gap={4}>
            <Group gap="xs" align="center">
              <Text fw={500}>{discount.name}</Text>
              <Badge color={discount.isActive ? 'green' : 'red'} size="sm">
                {discount.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </Group>
            <Group gap="xs" align="center">
              <Text size="sm" fw={500} c="blue">
                {discount.code}
              </Text>
              <ActionIcon
                size="xs"
                variant="light"
                color="blue"
                onClick={() => onCopyCode(discount.code)}
              >
                <Copy size={10} />
              </ActionIcon>
            </Group>
            <Text size="sm" c="dimmed">
              {discount.description}
            </Text>
          </Stack>
        </Group>

        <Group justify="space-between">
          <Badge
            color={getTypeColor(discount.type)}
            leftSection={getTypeIcon(discount.type)}
            size="lg"
          >
            {formatValue(discount.type, discount.value)}
          </Badge>
          <Text size="sm" c="dimmed">
            Valid: {discount.startDate} - {discount.endDate}
          </Text>
        </Group>

        {discount.usageLimit && (
          <div>
            <Group justify="space-between" mb="xs">
              <Text size="sm">Usage</Text>
              <Text size="sm">
                {discount.usageCount} / {discount.usageLimit}
              </Text>
            </Group>
            <Progress value={getUsagePercentage()} color="blue" size="sm" />
          </div>
        )}

        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            Created: {discount.createdAt}
          </Text>
          <Text size="xs" c="dimmed">
            By: {discount.createdBy}
          </Text>
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * FHIR Discount Form Modal
 */
interface FHIRDiscountFormModalProps {
  discount: FHIRDiscount | null;
  opened: boolean;
  onClose: () => void;
  onSave: (discount: Partial<FHIRDiscount>) => void;
}

const FHIRDiscountFormModal: React.FC<FHIRDiscountFormModalProps> = ({
  discount,
  opened,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage' as FHIRDiscount['type'],
    value: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    startDate: new Date(),
    endDate: new Date(),
    usageLimit: 0,
    isActive: true,
    applicableServices: [] as string[],
    customerRestrictions: 'all' as FHIRDiscount['customerRestrictions'],
  });

  React.useEffect(() => {
    if (discount) {
      setFormData({
        code: discount.code,
        name: discount.name,
        description: discount.description,
        type: discount.type,
        value: discount.value,
        minOrderAmount: discount.minOrderAmount || 0,
        maxDiscountAmount: discount.maxDiscountAmount || 0,
        startDate: new Date(discount.startDate),
        endDate: new Date(discount.endDate),
        usageLimit: discount.usageLimit || 0,
        isActive: discount.isActive,
        applicableServices: discount.applicableServices,
        customerRestrictions: discount.customerRestrictions,
      });
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        type: 'percentage',
        value: 0,
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        startDate: new Date(),
        endDate: new Date(),
        usageLimit: 0,
        isActive: true,
        applicableServices: [],
        customerRestrictions: 'all',
      });
    }
  }, [discount]);

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      startDate: formData.startDate.toISOString().split('T')[0],
      endDate: formData.endDate.toISOString().split('T')[0],
    };
    onSave(submitData);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          {discount ? 'Edit FHIR Discount' : 'Create New FHIR Discount'}
          <Badge size="xs" color="green" variant="light">
            <Database size={10} style={{ marginRight: 2 }} />
            FHIR ChargeItem
          </Badge>
        </Group>
      }
      size="lg"
    >
      <Stack gap="md">
        <Alert icon={<Database size={16} />} color="blue" variant="light">
          This will create/update a FHIR ChargeItem resource on the Medplum server.
        </Alert>

        <Grid>
          <Grid.Col span={8}>
            <TextInput
              label="Discount Name"
              placeholder="Enter discount name"
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.currentTarget.value })}
              required
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput
              label="Discount Code"
              placeholder="DISCOUNT20"
              value={formData.code}
              onChange={(event) => setFormData({ ...formData, code: event.currentTarget.value.toUpperCase() })}
              required
            />
          </Grid.Col>
        </Grid>

        <Textarea
          label="Description"
          placeholder="Enter discount description"
          value={formData.description}
          onChange={(event) => setFormData({ ...formData, description: event.currentTarget.value })}
          minRows={3}
        />

        <Grid>
          <Grid.Col span={6}>
            <Select
              label="Discount Type"
              data={[
                { value: 'percentage', label: 'Percentage Off' },
                { value: 'fixed_amount', label: 'Fixed Amount Off' },
                { value: 'free_service', label: 'Free Service' },
              ]}
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value as FHIRDiscount['type'] })}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label={formData.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
              placeholder="Enter value"
              value={formData.value}
              onChange={(value) => setFormData({ ...formData, value: Number(value) || 0 })}
              min={0}
              max={formData.type === 'percentage' ? 100 : undefined}
              required
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <NumberInput
              label="Minimum Order Amount ($)"
              placeholder="0"
              value={formData.minOrderAmount}
              onChange={(value) => setFormData({ ...formData, minOrderAmount: Number(value) || 0 })}
              min={0}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="Maximum Discount Amount ($)"
              placeholder="0 (unlimited)"
              value={formData.maxDiscountAmount}
              onChange={(value) => setFormData({ ...formData, maxDiscountAmount: Number(value) || 0 })}
              min={0}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <DateInput
              label="Start Date"
              value={formData.startDate}
              onChange={(value) => setFormData({ ...formData, startDate: value || new Date() })}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <DateInput
              label="End Date"
              value={formData.endDate}
              onChange={(value) => setFormData({ ...formData, endDate: value || new Date() })}
              required
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <NumberInput
              label="Usage Limit"
              placeholder="0 (unlimited)"
              value={formData.usageLimit}
              onChange={(value) => setFormData({ ...formData, usageLimit: Number(value) || 0 })}
              min={0}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Customer Restrictions"
              data={[
                { value: 'all', label: 'All Customers' },
                { value: 'new_customers', label: 'New Customers Only' },
                { value: 'existing_customers', label: 'Existing Customers Only' },
                { value: 'vip_only', label: 'VIP Customers Only' },
              ]}
              value={formData.customerRestrictions}
              onChange={(value) => setFormData({ ...formData, customerRestrictions: value as FHIRDiscount['customerRestrictions'] })}
              required
            />
          </Grid.Col>
        </Grid>

        <Switch
          label="Active"
          checked={formData.isActive}
          onChange={(event) => setFormData({ ...formData, isActive: event.currentTarget.checked })}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {discount ? 'Update FHIR Discount' : 'Create FHIR Discount'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Main Discounts-Medplum Page Component
 */
export const DiscountsMedplumPage: React.FC = () => {
  const [chargeItems, setChargeItems] = useState<ChargeItem[]>([]);
  const [discounts, setDiscounts] = useState<FHIRDiscount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedDiscount, setSelectedDiscount] = useState<FHIRDiscount | null>(null);
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);

  // Fetch FHIR charge items and convert to discounts
  useEffect(() => {
    const fetchChargeItems = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await backendFHIRService.searchResources('ChargeItem', {
          _sort: '-_lastUpdated',
          _count: '50'
        });

        if (response?.data) {
          setChargeItems(response.data as ChargeItem[]);
          const mappedDiscounts = (response.data as ChargeItem[]).map(mapChargeItemToDiscount);
          setDiscounts(mappedDiscounts);
        } else {
          setChargeItems([]);
          setDiscounts([]);
        }
      } catch (err) {
        console.error('Error fetching FHIR charge items:', err);
        setError('Failed to fetch discounts from FHIR server. Please check your connection.');
        setChargeItems([]);
        setDiscounts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChargeItems();
  }, []);

  const handleEditDiscount = (discount: FHIRDiscount) => {
    setSelectedDiscount(discount);
    openForm();
  };

  const handleCreateDiscount = () => {
    setSelectedDiscount(null);
    openForm();
  };

  const handleDeleteDiscount = async (discount: FHIRDiscount) => {
    modals.openConfirmModal({
      title: 'Delete FHIR Discount',
      children: (
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to delete the discount "{discount.name}"? This will delete the FHIR ChargeItem resource from the Medplum server.
          </Text>
          <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
            This action cannot be undone and will permanently remove the FHIR resource.
          </Alert>
        </Stack>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await backendFHIRService.deleteResource('ChargeItem', discount.id);
          
          setDiscounts(prev => prev.filter(d => d.id !== discount.id));
          setChargeItems(prev => prev.filter(c => c.id !== discount.id));
          notifications.show({
            title: 'Success',
            message: 'FHIR discount deleted successfully',
            color: 'green',
          });
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Failed to delete FHIR discount',
            color: 'red',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleToggleStatus = async (discount: FHIRDiscount) => {
    setIsLoading(true);
    try {
      const updatedChargeItem: ChargeItem = {
        ...discount.chargeItem,
        status: discount.isActive ? 'not-billable' : 'billable',
      };
      
      await backendFHIRService.updateResource('ChargeItem', discount.id, updatedChargeItem);
      
      setDiscounts(prev => prev.map(d => 
        d.id === discount.id 
          ? { ...d, isActive: !d.isActive, chargeItem: updatedChargeItem }
          : d
      ));
      
      notifications.show({
        title: 'Success',
        message: `FHIR discount ${discount.isActive ? 'deactivated' : 'activated'} successfully`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update FHIR discount status',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDiscount = async (discountData: Partial<FHIRDiscount>) => {
    setIsLoading(true);
    try {
      if (selectedDiscount) {
        // Update existing FHIR ChargeItem
        const updatedChargeItem: ChargeItem = {
          ...selectedDiscount.chargeItem,
          code: {
            text: discountData.name,
            coding: [{
              code: discountData.code,
              display: discountData.name,
            }]
          },
          definitionUri: [discountData.description || ''],
          status: discountData.isActive ? 'billable' : 'not-billable' as ChargeItem['status'],
          extension: [
            {
              url: 'discount-type',
              valueString: discountData.type,
            },
            {
              url: 'discount-value',
              valueDecimal: discountData.value,
            },
            {
              url: 'discount-percentage',
              valueDecimal: discountData.type === 'percentage' ? discountData.value : 0,
            },
            {
              url: 'discount-amount',
              valueDecimal: discountData.type === 'fixed_amount' ? discountData.value : 0,
            },
          ],
        };

        const updated = await backendFHIRService.updateResource('ChargeItem', selectedDiscount.id!, updatedChargeItem);
        const updatedDiscount = mapChargeItemToDiscount(updated);
        
        setDiscounts(prev => prev.map(d => 
          d.id === selectedDiscount.id ? updatedDiscount : d
        ));
        
        notifications.show({
          title: 'Success',
          message: 'FHIR discount updated successfully',
          color: 'green',
        });
      } else {
        // Create new FHIR ChargeItem
        const newChargeItem: ChargeItem = {
          resourceType: 'ChargeItem',
          subject: { reference: 'Patient/example' },
          code: {
            text: discountData.name,
            coding: [{
              code: discountData.code,
              display: discountData.name,
            }]
          },
          definitionUri: [discountData.description || ''],
          status: (discountData.isActive ? 'billable' : 'not-billable') as 'billable' | 'not-billable' | 'aborted' | 'billed' | 'entered-in-error' | 'unknown',
          extension: [
            {
              url: 'discount-type',
              valueString: discountData.type,
            },
            {
              url: 'discount-value',
              valueDecimal: discountData.value,
            },
            {
              url: 'discount-percentage',
              valueDecimal: discountData.type === 'percentage' ? discountData.value : 0,
            },
            {
              url: 'discount-amount',
              valueDecimal: discountData.type === 'fixed_amount' ? discountData.value : 0,
            },
          ],
        };

        const created = await backendFHIRService.createResource('ChargeItem', newChargeItem);
        const newDiscount = mapChargeItemToDiscount(created);
        
        setDiscounts(prev => [...prev, newDiscount]);
        setChargeItems(prev => [...prev, created]);
        
        notifications.show({
          title: 'Success',
          message: 'FHIR discount created successfully',
          color: 'green',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save FHIR discount',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      notifications.show({
        title: 'Copied!',
        message: `Discount code "${code}" copied to clipboard`,
        color: 'blue',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to copy discount code',
        color: 'red',
      });
    }
  };

  const handleDuplicateDiscount = async (discount: FHIRDiscount) => {
    setIsLoading(true);
    try {
      const duplicatedChargeItem: ChargeItem = {
        resourceType: 'ChargeItem',
        status: 'billable',
        subject: { reference: 'Patient/example' },
        code: {
          text: `${discount.name} (Copy)`,
          coding: [{
            code: `${discount.code}_COPY`,
            display: `${discount.name} (Copy)`,
          }]
        },
        definitionUri: [discount.description],
        extension: discount.chargeItem.extension,
      };

      const created = await backendFHIRService.createResource('ChargeItem', duplicatedChargeItem);
      const duplicatedDiscount = mapChargeItemToDiscount(created);
      
      setDiscounts(prev => [...prev, duplicatedDiscount]);
      setChargeItems(prev => [...prev, created]);
      
      notifications.show({
        title: 'Success',
        message: 'FHIR discount duplicated successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to duplicate FHIR discount',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDiscounts.length === 0) return;

    modals.openConfirmModal({
      title: 'Delete Selected FHIR Discounts',
      children: (
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to delete {selectedDiscounts.length} selected discount(s)? This will permanently delete the FHIR ChargeItem resources from the Medplum server.
          </Text>
          <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
            This action cannot be undone and will permanently remove the FHIR resources.
          </Alert>
        </Stack>
      ),
      labels: { confirm: 'Delete All', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await Promise.all(
            selectedDiscounts.map(id => backendFHIRService.deleteResource('ChargeItem', id))
          );
          
          setDiscounts(prev => prev.filter(d => !selectedDiscounts.includes(d.id)));
          setChargeItems(prev => prev.filter(c => !selectedDiscounts.includes(c.id || '')));
          setSelectedDiscounts([]);
          
          notifications.show({
            title: 'Success',
            message: `${selectedDiscounts.length} FHIR discount(s) deleted successfully`,
            color: 'green',
          });
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Failed to delete selected FHIR discounts',
            color: 'red',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleExportDiscounts = async () => {
    setIsLoading(true);
    try {
      const csvContent = [
        ['ID', 'Code', 'Name', 'Type', 'Value', 'Status', 'Usage', 'Start Date', 'End Date', 'FHIR Status'].join(','),
        ...filteredDiscounts.map(discount => [
          discount.id,
          discount.code,
          discount.name,
          discount.type,
          discount.value,
          discount.isActive ? 'Active' : 'Inactive',
          `${discount.usageCount}${discount.usageLimit ? `/${discount.usageLimit}` : ''}`,
          discount.startDate,
          discount.endDate,
          (discount.chargeItem.status as string) || 'unknown',
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fhir-discounts.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      
      notifications.show({
        title: 'Success',
        message: 'FHIR discounts exported successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to export FHIR discounts',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDiscount = (id: string, selected: boolean) => {
    setSelectedDiscounts(prev => 
      selected 
        ? [...prev, id]
        : prev.filter(discountId => discountId !== id)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedDiscounts(selected ? filteredDiscounts.map(d => d.id) : []);
  };

  const filteredDiscounts = useMemo(() => {
    return discounts
      .filter(discount =>
        discount.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discount.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discount.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter(discount => !typeFilter || discount.type === typeFilter)
      .filter(discount => {
        if (statusFilter === 'active') return discount.isActive;
        if (statusFilter === 'inactive') return !discount.isActive;
        if (statusFilter === 'expired') return new Date(discount.endDate) < new Date();
        if (statusFilter === 'upcoming') return new Date(discount.startDate) > new Date();
        return true;
      });
  }, [discounts, searchQuery, typeFilter, statusFilter]);

  // Calculate summary statistics
  const activeDiscounts = discounts.filter(d => d.isActive).length;
  const totalUsage = discounts.reduce((sum, d) => sum + d.usageCount, 0);
  const totalSavings = discounts.reduce((sum, d) => {
    if (d.type === 'fixed_amount') return sum + (d.value * d.usageCount);
    return sum + (d.usageCount * 25); // Estimated average savings for percentage discounts
  }, 0);
  const expiringSoon = discounts.filter(d => {
    const daysLeft = Math.ceil((new Date(d.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && daysLeft > 0;
  }).length;

  if (isLoading && discounts.length === 0) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Loading FHIR discounts...</Text>
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
            <Group gap="xs" mb="xs">
              <Title order={2}>Discounts &amp; Promotions</Title>
              <Badge color="green" variant="light">
                <Database size={12} style={{ marginRight: 4 }} />
                Live FHIR Data
              </Badge>
            </Group>
            <Text c="dimmed">Manage discount codes and promotional offers using FHIR ChargeItem resources</Text>
          </div>
          <Group>
            {selectedDiscounts.length > 0 && (
              <>
                <Button
                  variant="light"
                  color="red"
                  leftSection={<Trash2 size={16} />}
                  onClick={handleBulkDelete}
                  loading={isLoading}
                >
                  Delete Selected ({selectedDiscounts.length})
                </Button>
              </>
            )}
            <Button
              variant="light"
              leftSection={<Download size={16} />}
              onClick={handleExportDiscounts}
              loading={isLoading}
            >
              Export
            </Button>
            <Button leftSection={<Plus size={16} />} onClick={handleCreateDiscount}>
              Create Discount
            </Button>
          </Group>
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
                  Active Discounts
                </Text>
                <ActionIcon variant="light" color="green" size="lg">
                  <Percent size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="green">
                {activeDiscounts}
              </Text>
              <Text size="xs" c="dimmed">
                From FHIR ChargeItems
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Total Usage
                </Text>
                <ActionIcon variant="light" color="blue" size="lg">
                  <TrendingUp size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="blue">
                {totalUsage.toLocaleString()}
              </Text>
              <Text size="xs" c="dimmed">
                Across all discounts
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Total Savings
                </Text>
                <ActionIcon variant="light" color="orange" size="lg">
                  <DollarSign size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="orange">
                ${totalSavings.toLocaleString()}
              </Text>
              <Text size="xs" c="dimmed">
                Estimated value
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Expiring Soon
                </Text>
                <ActionIcon variant="light" color="red" size="lg">
                  <Clock size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="red">
                {expiringSoon}
              </Text>
              <Text size="xs" c="dimmed">
                Within 7 days
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Filters */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Grid align="end">
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <TextInput
                placeholder="Search discounts..."
                leftSection={<Search size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                placeholder="Filter by type"
                leftSection={<Filter size={16} />}
                data={[
                  { value: 'percentage', label: 'Percentage Off' },
                  { value: 'fixed_amount', label: 'Fixed Amount' },
                  { value: 'free_service', label: 'Free Service' },
                ]}
                value={typeFilter}
                onChange={setTypeFilter}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                placeholder="Filter by status"
                leftSection={<Clock size={16} />}
                data={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'expired', label: 'Expired' },
                  { value: 'upcoming', label: 'Upcoming' },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
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
          {filteredDiscounts.length > 0 && (
            <Group justify="space-between" mt="md">
              <Text size="sm" c="dimmed">
                Showing {filteredDiscounts.length} of {discounts.length} FHIR discounts
              </Text>
              {viewMode === 'table' && (
                <Checkbox
                  label="Select All"
                  checked={selectedDiscounts.length === filteredDiscounts.length}
                  indeterminate={selectedDiscounts.length > 0 && selectedDiscounts.length < filteredDiscounts.length}
                  onChange={(event) => handleSelectAll(event.currentTarget.checked)}
                />
              )}
            </Group>
          )}
        </Card>

        {/* Discounts Grid/Table */}
        {isLoading ? (
          <Center py="xl">
            <Loader size="lg" />
          </Center>
        ) : viewMode === 'cards' ? (
          <Grid>
            {filteredDiscounts.map((discount) => (
              <Grid.Col key={discount.id} span={{ base: 12, sm: 6, lg: 4 }}>
                <FHIRDiscountCard
                  discount={discount}
                  onEdit={handleEditDiscount}
                  onDelete={handleDeleteDiscount}
                  onToggleStatus={handleToggleStatus}
                  onCopyCode={handleCopyCode}
                  onDuplicate={handleDuplicateDiscount}
                  isSelected={selectedDiscounts.includes(discount.id)}
                  onSelect={handleSelectDiscount}
                />
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Discount</Table.Th>
                  <Table.Th>Type &amp; Value</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Start Date</Table.Th>
                  <Table.Th>End Date</Table.Th>
                  <Table.Th>Usage</Table.Th>
                  <Table.Th>Restrictions</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredDiscounts.map((discount) => (
                  <FHIRDiscountTableRow
                    key={discount.id}
                    discount={discount}
                    onEdit={handleEditDiscount}
                    onDelete={handleDeleteDiscount}
                    onToggleStatus={handleToggleStatus}
                    onCopyCode={handleCopyCode}
                    onDuplicate={handleDuplicateDiscount}
                    isSelected={selectedDiscounts.includes(discount.id)}
                    onSelect={handleSelectDiscount}
                  />
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && filteredDiscounts.length === 0 && (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Percent size={48} color="gray" />
              <Text size="lg" c="dimmed">
                No FHIR discounts found
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                {searchQuery || typeFilter || statusFilter
                  ? 'Try adjusting your search criteria'
                  : error 
                    ? 'Check your FHIR server connection'
                    : 'Get started by creating your first FHIR discount'}
              </Text>
              <Button leftSection={<Plus size={16} />} onClick={handleCreateDiscount}>
                Create FHIR Discount
              </Button>
            </Stack>
          </Center>
        )}
      </Stack>

      {/* FHIR Discount Form Modal */}
      <FHIRDiscountFormModal
        discount={selectedDiscount}
        opened={formOpened}
        onClose={closeForm}
        onSave={handleSaveDiscount}
      />
    </Container>
  );
};

export default DiscountsMedplumPage;