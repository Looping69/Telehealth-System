/**
 * Discounts Page Component
 * Manages discount codes, promotions, and pricing adjustments
 */

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';

/**
 * Discount interface
 */
interface Discount {
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
}

/**
 * Initial mock data for discounts (converted to stateful)
 */
const initialDiscounts: Discount[] = [
  {
    id: 'DISC-001',
    code: 'WELCOME20',
    name: 'Welcome Discount',
    description: '20% off first telehealth consultation for new patients',
    type: 'percentage',
    value: 20,
    minOrderAmount: 50,
    maxDiscountAmount: 100,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    usageLimit: 1000,
    usageCount: 234,
    isActive: true,
    applicableServices: ['Telehealth Consultation', 'Initial Assessment'],
    customerRestrictions: 'new_customers',
    createdBy: 'Practice Manager',
    createdAt: '2024-01-01',
    lastUsed: '2024-01-20',
  },
  {
    id: 'DISC-002',
    code: 'FOLLOWUP15',
    name: 'Follow-up Discount',
    description: '15% off follow-up appointments',
    type: 'percentage',
    value: 15,
    minOrderAmount: 30,
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    usageLimit: 500,
    usageCount: 89,
    isActive: true,
    applicableServices: ['Follow-up Consultation', 'Check-up'],
    customerRestrictions: 'existing_customers',
    createdBy: 'Dr. Sarah Johnson',
    createdAt: '2024-01-15',
    lastUsed: '2024-01-19',
  },
  {
    id: 'DISC-003',
    code: 'HEALTH50',
    name: 'Health Screening Special',
    description: '$50 off comprehensive health screening',
    type: 'fixed_amount',
    value: 50,
    minOrderAmount: 200,
    startDate: '2024-02-01',
    endDate: '2024-03-31',
    usageLimit: 100,
    usageCount: 23,
    isActive: true,
    applicableServices: ['Health Screening', 'Preventive Care'],
    customerRestrictions: 'all',
    createdBy: 'Marketing Team',
    createdAt: '2024-01-25',
    lastUsed: '2024-01-18',
  },
  {
    id: 'DISC-004',
    code: 'FREECONSULT',
    name: 'Free Initial Consultation',
    description: 'Complimentary first consultation for VIP patients',
    type: 'free_service',
    value: 100,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    usageLimit: 50,
    usageCount: 12,
    isActive: true,
    applicableServices: ['Initial Consultation'],
    customerRestrictions: 'vip_only',
    createdBy: 'Practice Manager',
    createdAt: '2024-01-01',
    lastUsed: '2024-01-17',
  },
  {
    id: 'DISC-005',
    code: 'SUMMER25',
    name: 'Summer Wellness',
    description: '25% off wellness packages during summer',
    type: 'percentage',
    value: 25,
    minOrderAmount: 100,
    maxDiscountAmount: 200,
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    usageLimit: 200,
    usageCount: 0,
    isActive: false,
    applicableServices: ['Wellness Package', 'Preventive Care'],
    customerRestrictions: 'all',
    createdBy: 'Marketing Team',
    createdAt: '2024-01-20',
  },
];

/**
 * Discount Card Component
 */
interface DiscountCardProps {
  discount: Discount;
  onEdit: (discount: Discount) => void;
  onDelete: (discount: Discount) => void;
  onToggleStatus: (discount: Discount) => void;
  onCopyCode: (code: string) => void;
}

/**
 * Discount Table Row Component
 */
interface DiscountTableRowProps {
  discount: Discount;
  onEdit: (discount: Discount) => void;
  onDelete: (discount: Discount) => void;
  onToggleStatus: (discount: Discount) => void;
  onCopyCode: (code: string) => void;
}

const DiscountTableRow: React.FC<DiscountTableRowProps> = ({
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
          <Text fw={500}>{discount.name}</Text>
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

const DiscountCard: React.FC<DiscountCardProps> = ({
  discount,
  onEdit,
  onDelete,
  onToggleStatus,
  onCopyCode,
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

  const getUsagePercentage = () => {
    if (!discount.usageLimit) return 0;
    return (discount.usageCount / discount.usageLimit) * 100;
  };

  const isExpired = new Date(discount.endDate) < new Date();
  const isUpcoming = new Date(discount.startDate) > new Date();

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Group gap="xs" align="center">
              <Text fw={500} size="lg">
                {discount.name}
              </Text>
              <Badge
                color={getTypeColor(discount.type)}
                leftSection={getTypeIcon(discount.type)}
              >
                {formatValue(discount.type, discount.value)}
              </Badge>
            </Group>
            <Group gap="xs" align="center">
              <Text size="sm" fw={500} c="blue">
                {discount.code}
              </Text>
              <ActionIcon
                size="sm"
                variant="light"
                color="blue"
                onClick={() => onCopyCode(discount.code)}
              >
                <Copy size={12} />
              </ActionIcon>
            </Group>
            <Text size="sm" c="dimmed" lineClamp={2}>
              {discount.description}
            </Text>
          </Stack>
          <Group>
            {isExpired && <Badge color="red" size="sm">Expired</Badge>}
            {isUpcoming && <Badge color="orange" size="sm">Upcoming</Badge>}
            <Badge color={discount.isActive ? 'green' : 'red'} size="sm">
              {discount.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </Group>
        </Group>

        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Valid: {discount.startDate} - {discount.endDate}
            </Text>
            <Group gap="xs">
              <Calendar size={14} />
              <Text size="sm" c="dimmed">
                {Math.ceil((new Date(discount.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
              </Text>
            </Group>
          </Group>

          {discount.usageLimit && (
            <div>
              <Group justify="space-between" mb={4}>
                <Text size="sm" c="dimmed">
                  Usage: {discount.usageCount} / {discount.usageLimit}
                </Text>
                <Text size="sm" c="dimmed">
                  {getUsagePercentage().toFixed(0)}%
                </Text>
              </Group>
              <Progress
                value={getUsagePercentage()}
                size="sm"
                color={getUsagePercentage() > 80 ? 'red' : getUsagePercentage() > 60 ? 'orange' : 'blue'}
              />
            </div>
          )}

          <Group gap="xs">
            <Users size={14} />
            <Text size="sm" c="dimmed">
              {discount.customerRestrictions.replace('_', ' ')}
            </Text>
          </Group>
        </Stack>

        <Group justify="space-between" align="center">
          <Badge size="sm" variant="light">
            {discount.applicableServices.length} service{discount.applicableServices.length !== 1 ? 's' : ''}
          </Badge>
          <Group gap="xs">
            <Tooltip label={discount.isActive ? 'Deactivate' : 'Activate'}>
              <ActionIcon
                variant="light"
                color={discount.isActive ? 'red' : 'green'}
                onClick={() => onToggleStatus(discount)}
              >
                <Clock size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Edit">
              <ActionIcon
                variant="light"
                color="blue"
                onClick={() => onEdit(discount)}
              >
                <Edit size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete">
              <ActionIcon
                variant="light"
                color="red"
                onClick={() => onDelete(discount)}
              >
                <Trash2 size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * Discount Form Modal
 */
interface DiscountFormModalProps {
  discount: Discount | null;
  opened: boolean;
  onClose: () => void;
  onSave: (discount: Partial<Discount>) => void;
}

const DiscountFormModal: React.FC<DiscountFormModalProps> = ({
  discount,
  opened,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage' as Discount['type'],
    value: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    startDate: new Date(),
    endDate: new Date(),
    usageLimit: 0,
    isActive: true,
    applicableServices: [] as string[],
    customerRestrictions: 'all' as Discount['customerRestrictions'],
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
      title={discount ? 'Edit Discount' : 'Create New Discount'}
      size="lg"
    >
      <Stack gap="md">
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
              onChange={(value) => setFormData({ ...formData, type: value as Discount['type'] })}
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
              onChange={(value) => setFormData({ ...formData, customerRestrictions: value as Discount['customerRestrictions'] })}
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
            {discount ? 'Update Discount' : 'Create Discount'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Main Discounts Page Component
 */
export const DiscountsPage: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>(initialDiscounts);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);

  const handleEditDiscount = (discount: Discount) => {
    setSelectedDiscount(discount);
    openForm();
  };

  const handleCreateDiscount = () => {
    setSelectedDiscount(null);
    openForm();
  };

  const handleDeleteDiscount = async (discount: Discount) => {
    modals.openConfirmModal({
      title: 'Delete Discount',
      children: (
        <Text size="sm">
          Are you sure you want to delete the discount "{discount.name}"? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        setIsLoading(true);
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setDiscounts(prev => prev.filter(d => d.id !== discount.id));
          notifications.show({
            title: 'Success',
            message: 'Discount deleted successfully',
            color: 'green',
          });
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Failed to delete discount',
            color: 'red',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleToggleStatus = async (discount: Discount) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDiscounts(prev => prev.map(d => 
        d.id === discount.id 
          ? { ...d, isActive: !d.isActive }
          : d
      ));
      
      notifications.show({
        title: 'Success',
        message: `Discount ${discount.isActive ? 'deactivated' : 'activated'} successfully`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update discount status',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDiscount = async (discountData: Partial<Discount>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (selectedDiscount) {
        // Update existing discount
        setDiscounts(prev => prev.map(d => 
          d.id === selectedDiscount.id 
            ? { ...d, ...discountData }
            : d
        ));
        notifications.show({
          title: 'Success',
          message: 'Discount updated successfully',
          color: 'green',
        });
      } else {
        // Create new discount
        const newDiscount: Discount = {
          id: `DISC-${String(discounts.length + 1).padStart(3, '0')}`,
          usageCount: 0,
          createdBy: 'Current User',
          createdAt: new Date().toISOString().split('T')[0],
          applicableServices: ['All Services'],
          ...discountData,
        } as Discount;
        
        setDiscounts(prev => [...prev, newDiscount]);
        notifications.show({
          title: 'Success',
          message: 'Discount created successfully',
          color: 'green',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save discount',
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

  const handleDuplicateDiscount = async (discount: Discount) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const duplicatedDiscount: Discount = {
        ...discount,
        id: `DISC-${String(discounts.length + 1).padStart(3, '0')}`,
        code: `${discount.code}_COPY`,
        name: `${discount.name} (Copy)`,
        usageCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'Current User',
      };
      
      setDiscounts(prev => [...prev, duplicatedDiscount]);
      notifications.show({
        title: 'Success',
        message: 'Discount duplicated successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to duplicate discount',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDiscounts.length === 0) return;

    modals.openConfirmModal({
      title: 'Delete Selected Discounts',
      children: (
        <Text size="sm">
          Are you sure you want to delete {selectedDiscounts.length} selected discount(s)? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete All', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        setIsLoading(true);
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setDiscounts(prev => prev.filter(d => !selectedDiscounts.includes(d.id)));
          setSelectedDiscounts([]);
          notifications.show({
            title: 'Success',
            message: `${selectedDiscounts.length} discount(s) deleted successfully`,
            color: 'green',
          });
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Failed to delete selected discounts',
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const csvContent = [
        ['ID', 'Code', 'Name', 'Type', 'Value', 'Status', 'Usage', 'Start Date', 'End Date'].join(','),
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
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'discounts.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      
      notifications.show({
        title: 'Success',
        message: 'Discounts exported successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to export discounts',
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

  const filteredDiscounts = discounts
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

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Discounts & Promotions</Title>
            <Text c="dimmed">Manage discount codes and promotional offers</Text>
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
                Showing {filteredDiscounts.length} of {discounts.length} discounts
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
                <DiscountCard
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
                  <Table.Th>Type & Value</Table.Th>
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
                  <DiscountTableRow
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
                No discounts found
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                {searchQuery || typeFilter || statusFilter
                  ? 'Try adjusting your search criteria'
                  : 'Get started by creating your first discount'}
              </Text>
              <Button leftSection={<Plus size={16} />} onClick={handleCreateDiscount}>
                Create Discount
              </Button>
            </Stack>
          </Center>
        )}
      </Stack>

      {/* Discount Form Modal */}
      <DiscountFormModal
        discount={selectedDiscount}
        opened={formOpened}
        onClose={closeForm}
        onSave={handleSaveDiscount}
      />
    </Container>
  );
};