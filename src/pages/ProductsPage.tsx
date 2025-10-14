/**
 * Products Page Component
 * Manages healthcare products, services, and pricing
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
  Image,
  Divider,
  Tooltip,
  Tabs,
  Table,
} from '@mantine/core';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Eye,
  Star,
  Filter,
  ShoppingCart,
  Heart,
  TrendingUp,
  Users,
  Calendar,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';

/**
 * Product interface
 */
interface Product {
  id: string;
  name: string;
  description: string;
  category: 'consultation' | 'screening' | 'therapy' | 'medication' | 'equipment' | 'wellness';
  price: number;
  duration?: number; // in minutes for services
  isActive: boolean;
  isPopular: boolean;
  rating: number;
  reviewCount: number;
  bookingCount: number;
  imageUrl?: string;
  features: string[];
  prerequisites?: string[];
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
}

/**
 * Mock data for products
 */
const mockProducts: Product[] = [
  {
    id: 'PROD-001',
    name: 'Initial Telehealth Consultation',
    description: 'Comprehensive initial consultation with a healthcare provider via video call',
    category: 'consultation',
    price: 150,
    duration: 45,
    isActive: true,
    isPopular: true,
    rating: 4.8,
    reviewCount: 234,
    bookingCount: 1250,
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=doctor%20video%20consultation%20telehealth%20professional%20medical&image_size=square',
    features: ['Video consultation', 'Medical history review', 'Treatment plan', 'Prescription if needed'],
    prerequisites: ['Valid ID', 'Medical history'],
    createdBy: 'Dr. Sarah Johnson',
    createdAt: '2024-01-01',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'PROD-002',
    name: 'Follow-up Consultation',
    description: 'Follow-up appointment to monitor progress and adjust treatment',
    category: 'consultation',
    price: 100,
    duration: 30,
    isActive: true,
    isPopular: true,
    rating: 4.7,
    reviewCount: 189,
    bookingCount: 890,
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=follow%20up%20medical%20consultation%20healthcare%20professional&image_size=square',
    features: ['Progress review', 'Treatment adjustment', 'Medication review', 'Next steps planning'],
    prerequisites: ['Previous consultation'],
    createdBy: 'Dr. Michael Chen',
    createdAt: '2024-01-05',
    lastUpdated: '2024-01-18',
  },
  {
    id: 'PROD-003',
    name: 'Comprehensive Health Screening',
    description: 'Complete health assessment including vital signs and basic lab work',
    category: 'screening',
    price: 250,
    duration: 90,
    isActive: true,
    isPopular: false,
    rating: 4.6,
    reviewCount: 67,
    bookingCount: 234,
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=health%20screening%20medical%20examination%20healthcare%20professional&image_size=square',
    features: ['Vital signs check', 'Basic lab work', 'Health risk assessment', 'Personalized recommendations'],
    prerequisites: ['Fasting 12 hours', 'Valid insurance'],
    createdBy: 'Practice Manager',
    createdAt: '2024-01-10',
    lastUpdated: '2024-01-20',
  },
  {
    id: 'PROD-004',
    name: 'Mental Health Therapy Session',
    description: 'Individual therapy session with licensed mental health professional',
    category: 'therapy',
    price: 120,
    duration: 60,
    isActive: true,
    isPopular: true,
    rating: 4.9,
    reviewCount: 156,
    bookingCount: 567,
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=mental%20health%20therapy%20session%20counseling%20professional&image_size=square',
    features: ['Individual therapy', 'Confidential session', 'Treatment planning', 'Coping strategies'],
    prerequisites: ['Initial assessment'],
    createdBy: 'Dr. Emily Rodriguez',
    createdAt: '2024-01-08',
    lastUpdated: '2024-01-19',
  },
  {
    id: 'PROD-005',
    name: 'Wellness Package - Monthly',
    description: 'Comprehensive monthly wellness program including consultations and resources',
    category: 'wellness',
    price: 299,
    isActive: true,
    isPopular: false,
    rating: 4.5,
    reviewCount: 89,
    bookingCount: 123,
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=wellness%20package%20healthcare%20holistic%20health%20program&image_size=square',
    features: ['Monthly consultation', 'Wellness resources', 'Health tracking', 'Nutrition guidance'],
    createdBy: 'Wellness Team',
    createdAt: '2024-01-12',
    lastUpdated: '2024-01-16',
  },
  {
    id: 'PROD-006',
    name: 'Blood Pressure Monitor Kit',
    description: 'Home blood pressure monitoring kit with digital device and instructions',
    category: 'equipment',
    price: 89,
    isActive: true,
    isPopular: false,
    rating: 4.4,
    reviewCount: 45,
    bookingCount: 78,
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=blood%20pressure%20monitor%20medical%20device%20healthcare%20equipment&image_size=square',
    features: ['Digital monitor', 'Easy-to-read display', 'Memory storage', 'Instructions included'],
    createdBy: 'Equipment Manager',
    createdAt: '2024-01-14',
    lastUpdated: '2024-01-17',
  },
];

/**
 * Product Card Component
 */
interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onView, onEdit, onToggleStatus }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'consultation':
        return 'blue';
      case 'screening':
        return 'green';
      case 'therapy':
        return 'purple';
      case 'medication':
        return 'orange';
      case 'equipment':
        return 'gray';
      case 'wellness':
        return 'pink';
      default:
        return 'gray';
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        {product.imageUrl && (
          <div style={{ position: 'relative' }}>
            <Image
              src={product.imageUrl}
              height={160}
              alt={product.name}
              radius="md"
            />
            {product.isPopular && (
              <Badge
                color="red"
                variant="filled"
                size="sm"
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                }}
              >
                Popular
              </Badge>
            )}
          </div>
        )}

        <Stack gap="xs">
          <Group justify="space-between" align="flex-start">
            <div style={{ flex: 1 }}>
              <Text fw={500} size="lg" lineClamp={2}>
                {product.name}
              </Text>
              <Text size="sm" c="dimmed" lineClamp={2}>
                {product.description}
              </Text>
            </div>
            <Badge color={getCategoryColor(product.category)} size="sm">
              {product.category}
            </Badge>
          </Group>

          <Group justify="space-between" align="center">
            <Group gap="xs">
              <Star size={14} fill="gold" color="gold" />
              <Text size="sm" fw={500}>
                {product.rating}
              </Text>
              <Text size="sm" c="dimmed">
                ({product.reviewCount})
              </Text>
            </Group>
            <Text fw={700} size="lg" c="blue">
              ${product.price}
            </Text>
          </Group>

          {product.duration && (
            <Group gap="xs">
              <Calendar size={14} />
              <Text size="sm" c="dimmed">
                {product.duration} minutes
              </Text>
            </Group>
          )}

          <Group gap="xs">
            <Users size={14} />
            <Text size="sm" c="dimmed">
              {product.bookingCount} bookings
            </Text>
          </Group>
        </Stack>

        <Group justify="space-between" align="center">
          <Badge color={product.isActive ? 'green' : 'red'} size="sm">
            {product.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <Group gap="xs">
            <Tooltip label="View Details">
              <ActionIcon
                variant="light"
                color="blue"
                onClick={() => onView(product)}
              >
                <Eye size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Edit">
              <ActionIcon
                variant="light"
                color="orange"
                onClick={() => onEdit(product)}
              >
                <Edit size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={product.isActive ? 'Deactivate' : 'Activate'}>
              <ActionIcon
                variant="light"
                color={product.isActive ? 'red' : 'green'}
                onClick={() => onToggleStatus(product)}
              >
                <Package size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * Product Details Modal
 */
interface ProductDetailsModalProps {
  product: Product | null;
  opened: boolean;
  onClose: () => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, opened, onClose }) => {
  if (!product) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={product.name}
      size="lg"
    >
      <Stack gap="md">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            height={200}
            alt={product.name}
            radius="md"
          />
        )}

        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={3}>{product.name}</Title>
            <Text c="dimmed" mt={4}>
              {product.description}
            </Text>
            <Group gap="xs" mt="xs">
              <Badge color="blue">{product.category}</Badge>
              {product.isPopular && <Badge color="red">Popular</Badge>}
              <Badge color={product.isActive ? 'green' : 'red'}>
                {product.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </Group>
          </div>
          <Text fw={700} size="xl" c="blue">
            ${product.price}
          </Text>
        </Group>

        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="features">Features</Tabs.Tab>
            <Tabs.Tab value="stats">Statistics</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <Stack gap="md">
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text fw={500}>Product Details</Text>
                    {product.duration && (
                      <Text size="sm">
                        <strong>Duration:</strong> {product.duration} minutes
                      </Text>
                    )}
                    <Text size="sm">
                      <strong>Category:</strong> {product.category}
                    </Text>
                    <Text size="sm">
                      <strong>Created by:</strong> {product.createdBy}
                    </Text>
                    <Text size="sm">
                      <strong>Created:</strong> {product.createdAt}
                    </Text>
                    <Text size="sm">
                      <strong>Last updated:</strong> {product.lastUpdated}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text fw={500}>Performance</Text>
                    <Group gap="xs">
                      <Star size={16} fill="gold" color="gold" />
                      <Text size="sm">
                        {product.rating} ({product.reviewCount} reviews)
                      </Text>
                    </Group>
                    <Text size="sm">
                      <strong>Total bookings:</strong> {product.bookingCount}
                    </Text>
                    <Text size="sm">
                      <strong>Status:</strong> {product.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="features" pt="md">
            <Stack gap="md">
              <div>
                <Text fw={500} mb="xs">Features Included</Text>
                <Stack gap="xs">
                  {product.features.map((feature, index) => (
                    <Group key={index} gap="xs">
                      <Text size="sm">• {feature}</Text>
                    </Group>
                  ))}
                </Stack>
              </div>

              {product.prerequisites && product.prerequisites.length > 0 && (
                <div>
                  <Text fw={500} mb="xs">Prerequisites</Text>
                  <Stack gap="xs">
                    {product.prerequisites.map((prerequisite, index) => (
                      <Group key={index} gap="xs">
                        <Text size="sm" c="orange">• {prerequisite}</Text>
                      </Group>
                    ))}
                  </Stack>
                </div>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="stats" pt="md">
            <Stack gap="md">
              <Grid>
                <Grid.Col span={6}>
                  <Card withBorder padding="md">
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="dimmed">Total Bookings</Text>
                      <ShoppingCart size={16} />
                    </Group>
                    <Text fw={700} size="xl">{product.bookingCount}</Text>
                  </Card>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Card withBorder padding="md">
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="dimmed">Average Rating</Text>
                      <Star size={16} />
                    </Group>
                    <Text fw={700} size="xl">{product.rating}</Text>
                  </Card>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Card withBorder padding="md">
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="dimmed">Total Revenue</Text>
                      <DollarSign size={16} />
                    </Group>
                    <Text fw={700} size="xl">
                      ${(product.price * product.bookingCount).toLocaleString()}
                    </Text>
                  </Card>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Card withBorder padding="md">
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="dimmed">Reviews</Text>
                      <Heart size={16} />
                    </Group>
                    <Text fw={700} size="xl">{product.reviewCount}</Text>
                  </Card>
                </Grid.Col>
              </Grid>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
          <Button>Edit Product</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Product Form Modal
 */
interface ProductFormModalProps {
  product: Product | null;
  opened: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, opened, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'consultation' as Product['category'],
    price: 0,
    duration: 0,
    isActive: true,
    isPopular: false,
    features: [] as string[],
    prerequisites: [] as string[],
  });

  React.useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        duration: product.duration || 0,
        isActive: product.isActive,
        isPopular: product.isPopular,
        features: product.features,
        prerequisites: product.prerequisites || [],
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'consultation',
        price: 0,
        duration: 0,
        isActive: true,
        isPopular: false,
        features: [],
        prerequisites: [],
      });
    }
  }, [product]);

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Create New Product'}
      size="lg"
    >
      <Stack gap="md">
        <TextInput
          label="Product Name"
          placeholder="Enter product name"
          value={formData.name}
          onChange={(event) => setFormData({ ...formData, name: event.currentTarget.value })}
          required
        />

        <Textarea
          label="Description"
          placeholder="Enter product description"
          value={formData.description}
          onChange={(event) => setFormData({ ...formData, description: event.currentTarget.value })}
          minRows={3}
          required
        />

        <Grid>
          <Grid.Col span={6}>
            <Select
              label="Category"
              data={[
                { value: 'consultation', label: 'Consultation' },
                { value: 'screening', label: 'Screening' },
                { value: 'therapy', label: 'Therapy' },
                { value: 'medication', label: 'Medication' },
                { value: 'equipment', label: 'Equipment' },
                { value: 'wellness', label: 'Wellness' },
              ]}
              value={formData.category}
              onChange={(value) => setFormData({ ...formData, category: value as Product['category'] })}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="Price ($)"
              placeholder="0.00"
              value={formData.price}
              onChange={(value) => setFormData({ ...formData, price: Number(value) || 0 })}
              min={0}
              decimalScale={2}
              required
            />
          </Grid.Col>
        </Grid>

        <NumberInput
          label="Duration (minutes)"
          placeholder="0"
          value={formData.duration}
          onChange={(value) => setFormData({ ...formData, duration: Number(value) || 0 })}
          min={0}
        />

        <Group>
          <Switch
            label="Active"
            checked={formData.isActive}
            onChange={(event) => setFormData({ ...formData, isActive: event.currentTarget.checked })}
          />
          <Switch
            label="Popular"
            checked={formData.isPopular}
            onChange={(event) => setFormData({ ...formData, isPopular: event.currentTarget.checked })}
          />
        </Group>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {product ? 'Update Product' : 'Create Product'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Main Products Page Component
 */
export const ProductsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);

  // Using mock data for now
  const products = mockProducts;
  const isLoading = false;

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    openDetails();
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    openForm();
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    openForm();
  };

  const handleToggleStatus = (product: Product) => {
    // TODO: Implement status toggle
    console.log('Toggle status:', product);
  };

  const handleSaveProduct = (productData: Partial<Product>) => {
    // TODO: Implement product save
    console.log('Save product:', productData);
  };

  const filteredProducts = products
    .filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(product => !categoryFilter || product.category === categoryFilter)
    .filter(product => {
      if (statusFilter === 'active') return product.isActive;
      if (statusFilter === 'inactive') return !product.isActive;
      if (statusFilter === 'popular') return product.isPopular;
      return true;
    });

  // Calculate summary statistics
  const activeProducts = products.filter(p => p.isActive).length;
  const totalRevenue = products.reduce((sum, p) => sum + (p.price * p.bookingCount), 0);
  const totalBookings = products.reduce((sum, p) => sum + p.bookingCount, 0);
  const avgRating = products.reduce((sum, p) => sum + p.rating, 0) / products.length;

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Products &amp; Services</Title>
            <Text c="dimmed">Manage your healthcare products and service offerings</Text>
          </div>
          <Button leftSection={<Plus size={16} />} onClick={handleCreateProduct}>
            Add Product
          </Button>
        </Group>

        {/* Summary Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Active Products
                </Text>
                <ActionIcon variant="light" color="green" size="lg">
                  <Package size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="green">
                {activeProducts}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Total Revenue
                </Text>
                <ActionIcon variant="light" color="blue" size="lg">
                  <DollarSign size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="blue">
                ${totalRevenue.toLocaleString()}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Total Bookings
                </Text>
                <ActionIcon variant="light" color="orange" size="lg">
                  <ShoppingCart size={20} />
                </ActionIcon>
              </Group>
              <Text fw={700} size="xl" c="orange">
                {totalBookings.toLocaleString()}
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
        </Grid>

        {/* Filters */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Grid align="end">
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <TextInput
                placeholder="Search products..."
                leftSection={<Search size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                placeholder="Filter by category"
                leftSection={<Filter size={16} />}
                data={[
                  { value: 'consultation', label: 'Consultation' },
                  { value: 'screening', label: 'Screening' },
                  { value: 'therapy', label: 'Therapy' },
                  { value: 'medication', label: 'Medication' },
                  { value: 'equipment', label: 'Equipment' },
                  { value: 'wellness', label: 'Wellness' },
                ]}
                value={categoryFilter}
                onChange={setCategoryFilter}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                placeholder="Filter by status"
                leftSection={<TrendingUp size={16} />}
                data={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'popular', label: 'Popular' },
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
        </Card>

        {/* Products Display */}
        {isLoading ? (
          <Center py="xl">
            <Loader size="lg" />
          </Center>
        ) : viewMode === 'cards' ? (
          <Grid>
            {filteredProducts.map((product) => (
              <Grid.Col key={product.id} span={{ base: 12, sm: 6, lg: 4 }}>
                <ProductCard
                  product={product}
                  onView={handleViewProduct}
                  onEdit={handleEditProduct}
                  onToggleStatus={handleToggleStatus}
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
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Price</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Rating</Table.Th>
                  <Table.Th>Bookings</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredProducts.map((product) => (
                  <Table.Tr key={product.id}>
                    <Table.Td>
                      <Group gap="sm">
                        {product.imageUrl && (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={40}
                            height={40}
                            radius="sm"
                          />
                        )}
                        <div>
                          <Text fw={500} size="sm">
                            {product.name}
                          </Text>
                          <Text size="xs" c="dimmed" truncate>
                            {product.description}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color={
                          product.category === 'consultation' ? 'blue' :
                          product.category === 'screening' ? 'green' :
                          product.category === 'therapy' ? 'purple' :
                          product.category === 'medication' ? 'orange' :
                          product.category === 'equipment' ? 'gray' :
                          'teal'
                        }
                        size="sm"
                      >
                        {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500} size="sm">
                        ${product.price}
                      </Text>
                      {product.duration && (
                        <Text size="xs" c="dimmed">
                          {product.duration} min
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Badge
                          variant="light"
                          color={product.isActive ? 'green' : 'red'}
                          size="sm"
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {product.isPopular && (
                          <Badge variant="light" color="yellow" size="sm">
                            Popular
                          </Badge>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Star size={14} fill="currentColor" color="orange" />
                        <Text size="sm" fw={500}>
                          {product.rating}
                        </Text>
                        <Text size="xs" c="dimmed">
                          ({product.reviewCount})
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {product.bookingCount}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="View Details">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            size="sm"
                            onClick={() => handleViewProduct(product)}
                          >
                            <Eye size={14} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Edit Product">
                          <ActionIcon
                            variant="light"
                            color="orange"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit size={14} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={product.isActive ? 'Deactivate' : 'Activate'}>
                          <ActionIcon
                            variant="light"
                            color={product.isActive ? 'red' : 'green'}
                            size="sm"
                            onClick={() => handleToggleStatus(product)}
                          >
                            {product.isActive ? <Trash2 size={14} /> : <Plus size={14} />}
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && filteredProducts.length === 0 && (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Package size={48} color="gray" />
              <Text size="lg" c="dimmed">
                No products found
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                {searchQuery || categoryFilter || statusFilter
                  ? 'Try adjusting your search criteria'
                  : 'Get started by adding your first product or service'}
              </Text>
              <Button leftSection={<Plus size={16} />} onClick={handleCreateProduct}>
                Add Product
              </Button>
            </Stack>
          </Center>
        )}
      </Stack>

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        opened={detailsOpened}
        onClose={closeDetails}
      />

      {/* Product Form Modal */}
      <ProductFormModal
        product={selectedProduct}
        opened={formOpened}
        onClose={closeForm}
        onSave={handleSaveProduct}
      />
    </Container>
  );
};