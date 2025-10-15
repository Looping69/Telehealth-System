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
 * Mock data for GLP-1 products and services
 */
const mockProducts: Product[] = [
  // GLP-1 Medications
  {
    id: 'PROD-001',
    name: 'Ozempic® (Semaglutide)',
    description: 'Weekly GLP-1 receptor agonist injection for type 2 diabetes and weight management',
    category: 'medication',
    price: 936,
    isActive: true,
    isPopular: true,
    rating: 4.7,
    reviewCount: 1247,
    bookingCount: 3456,
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=ozempic%20semaglutide%20injection%20pen%20diabetes%20medication&image_size=square',
    features: ['Once-weekly injection', 'Pre-filled pen', 'Proven weight loss', 'Cardiovascular benefits', 'A1C reduction'],
    prerequisites: ['Type 2 diabetes diagnosis', 'Medical consultation', 'Insurance verification'],
    createdBy: 'Dr. Sarah Johnson',
    createdAt: '2024-01-01',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'PROD-002',
    name: 'Wegovy® (Semaglutide)',
    description: 'Weekly GLP-1 injection specifically approved for chronic weight management',
    category: 'medication',
    price: 1349,
    isActive: true,
    isPopular: true,
    rating: 4.6,
    reviewCount: 892,
    bookingCount: 2134,
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=wegovy%20semaglutide%20weight%20loss%20injection%20pen&image_size=square',
    features: ['Once-weekly injection', 'Higher dose for weight loss', 'FDA-approved for obesity', 'Appetite suppression', 'Significant weight reduction'],
    prerequisites: ['BMI ≥30 or ≥27 with comorbidities', 'Medical evaluation', 'Insurance pre-authorization'],
    createdBy: 'Dr. Michael Chen',
    createdAt: '2024-01-05',
    lastUpdated: '2024-01-18',
  },
  {
    id: 'PROD-003',
    name: 'Mounjaro® (Tirzepatide)',
    description: 'Dual GIP/GLP-1 receptor agonist for superior diabetes control and weight loss',
    category: 'medication',
    price: 1023,
    isActive: true,
    isPopular: true,
    rating: 4.8,
    reviewCount: 756,
    bookingCount: 1987,
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=mounjaro%20tirzepatide%20injection%20pen%20diabetes%20medication&image_size=square',
    features: ['Once-weekly injection', 'Dual hormone action', 'Superior A1C reduction', 'Significant weight loss', 'Cardiovascular protection'],
    prerequisites: ['Type 2 diabetes diagnosis', 'Specialist consultation', 'Prior authorization'],
    createdBy: 'Dr. Emily Rodriguez',
    createdAt: '2024-01-08',
    lastUpdated: '2024-01-19',
  },
  {
    id: 'PROD-004',
    name: 'Zepbound® (Tirzepatide)',
    description: 'FDA-approved tirzepatide for chronic weight management in adults',
    category: 'medication',
    price: 1059,
    isActive: true,
    isPopular: false,
    rating: 4.7,
    reviewCount: 423,
    bookingCount: 876,
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=zepbound%20tirzepatide%20weight%20loss%20injection%20pen&image_size=square',
    features: ['Once-weekly injection', 'Dual incretin action', 'Proven weight loss efficacy', 'Appetite control', 'Metabolic benefits'],
    prerequisites: ['BMI ≥30 or ≥27 with weight-related conditions', 'Medical assessment', 'Insurance coverage review'],
    createdBy: 'Dr. Lisa Park',
    createdAt: '2024-01-10',
    lastUpdated: '2024-01-20',
  },
  {
    id: 'PROD-005',
    name: 'Rybelsus® (Oral Semaglutide)',
    description: 'First and only oral GLP-1 medication for type 2 diabetes management',
    category: 'medication',
    price: 892,
    isActive: true,
    isPopular: false,
    rating: 4.4,
    reviewCount: 634,
    bookingCount: 1245,
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=rybelsus%20oral%20semaglutide%20tablets%20diabetes%20medication&image_size=square',
    features: ['Daily oral tablet', 'No injections required', 'A1C reduction', 'Weight loss benefits', 'Convenient dosing'],
    prerequisites: ['Type 2 diabetes diagnosis', 'Fasting administration', 'Medical monitoring'],
    createdBy: 'Dr. James Wilson',
    createdAt: '2024-01-12',
    lastUpdated: '2024-01-16',
  },

  // Subscription Services
  {
    id: 'PROD-006',
    name: 'GLP-1 Complete Care - Monthly',
    description: 'Comprehensive monthly subscription including medication, monitoring, and support',
    category: 'wellness',
    price: 1299,
    isActive: true,
    isPopular: true,
    rating: 4.9,
    reviewCount: 567,
    bookingCount: 1456,
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=glp1%20subscription%20care%20package%20medical%20support&image_size=square',
    features: ['Monthly medication delivery', 'Weekly check-ins', 'Nutrition counseling', 'Side effect management', '24/7 support hotline'],
    prerequisites: ['Medical evaluation', 'Subscription agreement', 'Insurance verification'],
    createdBy: 'Care Team',
    createdAt: '2024-01-14',
    lastUpdated: '2024-01-17',
  },
  {
    id: 'PROD-007',
    name: 'Weight Management Subscription',
    description: 'Quarterly subscription for comprehensive weight management with GLP-1 therapy',
    category: 'wellness',
    price: 3599,
    isActive: true,
    isPopular: false,
    rating: 4.6,
    reviewCount: 234,
    bookingCount: 567,
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=weight%20management%20subscription%20glp1%20therapy%20program&image_size=square',
    features: ['3-month medication supply', 'Monthly provider visits', 'Dietitian consultations', 'Exercise planning', 'Progress tracking'],
    prerequisites: ['Weight management candidacy', 'Quarterly commitment', 'Health assessment'],
    createdBy: 'Weight Management Team',
    createdAt: '2024-01-15',
    lastUpdated: '2024-01-18',
  },

  // Consultation Services
  {
    id: 'PROD-008',
    name: 'GLP-1 Initial Consultation',
    description: 'Comprehensive evaluation for GLP-1 therapy candidacy and treatment planning',
    category: 'consultation',
    price: 299,
    duration: 60,
    isActive: true,
    isPopular: true,
    rating: 4.8,
    reviewCount: 892,
    bookingCount: 2345,
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=doctor%20consultation%20glp1%20diabetes%20weight%20management&image_size=square',
    features: ['Medical history review', 'Candidacy assessment', 'Treatment plan development', 'Insurance guidance', 'Injection training'],
    prerequisites: ['Medical records', 'Lab results', 'Insurance information'],
    createdBy: 'Dr. Sarah Johnson',
    createdAt: '2024-01-01',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'PROD-009',
    name: 'Diabetes Management Consultation',
    description: 'Specialized consultation for diabetes care optimization with GLP-1 therapy',
    category: 'consultation',
    price: 249,
    duration: 45,
    isActive: true,
    isPopular: false,
    rating: 4.7,
    reviewCount: 456,
    bookingCount: 1234,
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=diabetes%20consultation%20endocrinologist%20glp1%20therapy&image_size=square',
    features: ['A1C goal setting', 'Medication optimization', 'Lifestyle counseling', 'Complication screening', 'Follow-up planning'],
    prerequisites: ['Diabetes diagnosis', 'Recent lab work', 'Current medication list'],
    createdBy: 'Dr. Michael Chen',
    createdAt: '2024-01-05',
    lastUpdated: '2024-01-18',
  },

  // Monitoring and Support
  {
    id: 'PROD-010',
    name: 'GLP-1 Monitoring Package',
    description: 'Comprehensive monitoring kit for patients on GLP-1 therapy',
    category: 'equipment',
    price: 189,
    isActive: true,
    isPopular: false,
    rating: 4.5,
    reviewCount: 234,
    bookingCount: 567,
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=glp1%20monitoring%20kit%20blood%20glucose%20meter%20scale&image_size=square',
    features: ['Blood glucose meter', 'Smart scale', 'Blood pressure cuff', 'Mobile app integration', 'Progress tracking'],
    prerequisites: ['GLP-1 prescription', 'Smartphone compatibility', 'Training session'],
    createdBy: 'Equipment Team',
    createdAt: '2024-01-10',
    lastUpdated: '2024-01-20',
  },
  {
    id: 'PROD-011',
    name: 'Injection Training & Support',
    description: 'Comprehensive training program for GLP-1 injection technique and management',
    category: 'consultation',
    price: 149,
    duration: 30,
    isActive: true,
    isPopular: true,
    rating: 4.9,
    reviewCount: 678,
    bookingCount: 1567,
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=injection%20training%20glp1%20pen%20technique%20education&image_size=square',
    features: ['Proper injection technique', 'Site rotation guidance', 'Pen device training', 'Storage instructions', 'Troubleshooting tips'],
    prerequisites: ['GLP-1 prescription', 'Initial consultation completed'],
    createdBy: 'Diabetes Educator',
    createdAt: '2024-01-08',
    lastUpdated: '2024-01-19',
  },

  // Educational Programs
  {
    id: 'PROD-012',
    name: 'GLP-1 Education Program',
    description: 'Comprehensive educational program about GLP-1 therapy and lifestyle optimization',
    category: 'wellness',
    price: 199,
    isActive: true,
    isPopular: false,
    rating: 4.6,
    reviewCount: 345,
    bookingCount: 789,
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=glp1%20education%20program%20diabetes%20weight%20management%20learning&image_size=square',
    features: ['Online modules', 'Interactive content', 'Progress tracking', 'Certificate completion', 'Expert Q&A sessions'],
    prerequisites: ['Program enrollment', 'Internet access', 'Commitment to completion'],
    createdBy: 'Education Team',
    createdAt: '2024-01-12',
    lastUpdated: '2024-01-16',
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