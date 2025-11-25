/**
 * Resources Page Component
 * Manages educational resources, documents, and content library
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
  Textarea,
  Switch,
  Center,
  Loader,
  Image,
  Divider,
  Tooltip,
  Tabs,
  FileInput,
  Anchor,
  Progress,
  Avatar,
  Table,
  Checkbox,
  Menu,
  NumberInput,
  MultiSelect,
  Notification,
  ThemeIcon,
} from '@mantine/core';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  FileText,
  Download,
  Eye,
  Star,
  Filter,
  BookOpen,
  Video,
  Image as ImageIcon,
  File,
  Calendar,
  User,
  Clock,
  TrendingUp,
  Users,
  Heart,
  Copy,
  Share,
  MoreVertical,
  Upload,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';

/**
 * Resource interface
 */
interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'image' | 'article' | 'guide' | 'form';
  category: 'patient-education' | 'provider-training' | 'policies' | 'forms' | 'marketing' | 'research';
  fileUrl?: string;
  thumbnailUrl?: string;
  fileSize?: number; // in bytes
  duration?: number; // in minutes for videos
  isPublic: boolean;
  isFeatured: boolean;
  tags: string[];
  viewCount: number;
  downloadCount: number;
  rating: number;
  reviewCount: number;
  author: string;
  authorAvatar?: string;
  createdAt: string;
  lastUpdated: string;
  language: string;
}

/**
 * Mock data for resources
 */
const mockResources: Resource[] = [
  {
    id: 'RES-001',
    title: 'Understanding Telehealth: A Patient Guide',
    description: 'Comprehensive guide explaining how telehealth works, what to expect, and how to prepare for virtual appointments',
    type: 'document',
    category: 'patient-education',
    fileUrl: '/resources/telehealth-guide.pdf',
    thumbnailUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=telehealth%20patient%20guide%20medical%20document%20healthcare&image_size=square',
    fileSize: 2048000, // 2MB
    isPublic: true,
    isFeatured: true,
    tags: ['telehealth', 'patient-guide', 'getting-started'],
    viewCount: 1250,
    downloadCount: 890,
    rating: 4.8,
    reviewCount: 156,
    author: 'Dr. Sarah Johnson',
    authorAvatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20doctor%20portrait%20healthcare&image_size=square',
    createdAt: '2024-01-01',
    lastUpdated: '2024-01-15',
    language: 'English',
  },
  {
    id: 'RES-002',
    title: 'How to Use Our Patient Portal',
    description: 'Step-by-step video tutorial showing patients how to navigate and use the patient portal effectively',
    type: 'video',
    category: 'patient-education',
    fileUrl: '/resources/portal-tutorial.mp4',
    thumbnailUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=patient%20portal%20tutorial%20video%20healthcare%20technology&image_size=square',
    duration: 15,
    isPublic: true,
    isFeatured: true,
    tags: ['patient-portal', 'tutorial', 'video-guide'],
    viewCount: 2340,
    downloadCount: 567,
    rating: 4.7,
    reviewCount: 89,
    author: 'Tech Support Team',
    createdAt: '2024-01-05',
    lastUpdated: '2024-01-18',
    language: 'English',
  },
  {
    id: 'RES-003',
    title: 'HIPAA Compliance Training Module',
    description: 'Mandatory training module for all healthcare providers covering HIPAA regulations and best practices',
    type: 'document',
    category: 'provider-training',
    fileUrl: '/resources/hipaa-training.pdf',
    thumbnailUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=HIPAA%20compliance%20training%20healthcare%20privacy%20security&image_size=square',
    fileSize: 5120000, // 5MB
    isPublic: false,
    isFeatured: false,
    tags: ['hipaa', 'compliance', 'training', 'mandatory'],
    viewCount: 456,
    downloadCount: 234,
    rating: 4.6,
    reviewCount: 67,
    author: 'Compliance Officer',
    createdAt: '2024-01-08',
    lastUpdated: '2024-01-20',
    language: 'English',
  },
  {
    id: 'RES-004',
    title: 'Mental Health Resources Directory',
    description: 'Comprehensive directory of mental health resources, hotlines, and support services for patients',
    type: 'article',
    category: 'patient-education',
    thumbnailUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=mental%20health%20resources%20support%20directory%20healthcare&image_size=square',
    isPublic: true,
    isFeatured: true,
    tags: ['mental-health', 'resources', 'support', 'directory'],
    viewCount: 1890,
    downloadCount: 345,
    rating: 4.9,
    reviewCount: 123,
    author: 'Dr. Emily Rodriguez',
    authorAvatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20therapist%20portrait%20mental%20health&image_size=square',
    createdAt: '2024-01-10',
    lastUpdated: '2024-01-19',
    language: 'English',
  },
  {
    id: 'RES-005',
    title: 'New Patient Registration Form',
    description: 'Standard registration form for new patients including medical history and insurance information',
    type: 'form',
    category: 'forms',
    fileUrl: '/resources/registration-form.pdf',
    thumbnailUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=patient%20registration%20form%20medical%20document%20healthcare&image_size=square',
    fileSize: 512000, // 512KB
    isPublic: true,
    isFeatured: false,
    tags: ['registration', 'new-patient', 'form', 'intake'],
    viewCount: 3450,
    downloadCount: 2890,
    rating: 4.5,
    reviewCount: 234,
    author: 'Practice Manager',
    createdAt: '2024-01-12',
    lastUpdated: '2024-01-16',
    language: 'English',
  },
  {
    id: 'RES-006',
    title: 'Telehealth Best Practices Guide',
    description: 'Internal guide for healthcare providers on conducting effective telehealth consultations',
    type: 'guide',
    category: 'provider-training',
    fileUrl: '/resources/telehealth-best-practices.pdf',
    thumbnailUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=telehealth%20best%20practices%20provider%20guide%20medical%20training&image_size=square',
    fileSize: 3072000, // 3MB
    isPublic: false,
    isFeatured: true,
    tags: ['telehealth', 'best-practices', 'provider-guide', 'training'],
    viewCount: 678,
    downloadCount: 456,
    rating: 4.8,
    reviewCount: 78,
    author: 'Dr. Michael Chen',
    authorAvatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20male%20doctor%20portrait%20healthcare&image_size=square',
    createdAt: '2024-01-14',
    lastUpdated: '2024-01-17',
    language: 'English',
  },
];

/**
 * Resource Card Component
 */
interface ResourceCardProps {
  resource: Resource;
  onView: (resource: Resource) => void;
  onEdit: (resource: Resource) => void;
  onDownload: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
  onDuplicate: (resource: Resource) => void;
  isSelected: boolean;
  onSelect: (resourceId: string) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ 
  resource, 
  onView, 
  onEdit, 
  onDownload, 
  onDelete, 
  onDuplicate, 
  isSelected, 
  onSelect 
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText size={16} />;
      case 'video':
        return <Video size={16} />;
      case 'image':
        return <ImageIcon size={16} />;
      case 'article':
        return <BookOpen size={16} />;
      case 'guide':
        return <BookOpen size={16} />;
      case 'form':
        return <File size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'patient-education':
        return 'blue';
      case 'provider-training':
        return 'green';
      case 'policies':
        return 'red';
      case 'forms':
        return 'orange';
      case 'marketing':
        return 'purple';
      case 'research':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        {resource.thumbnailUrl && (
          <div style={{ position: 'relative' }}>
            <Image
              src={resource.thumbnailUrl}
              height={160}
              alt={resource.title}
              radius="md"
            />
            {resource.isFeatured && (
              <Badge
                color="yellow"
                variant="filled"
                size="sm"
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                }}
              >
                Featured
              </Badge>
            )}
            <Badge
              color={getCategoryColor(resource.category)}
              variant="filled"
              size="sm"
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
              }}
            >
              {getTypeIcon(resource.type)}
            </Badge>
          </div>
        )}

        <Stack gap="xs">
          <Group justify="space-between" align="flex-start">
            <div style={{ flex: 1 }}>
              <Text fw={500} size="lg" lineClamp={2}>
                {resource.title}
              </Text>
              <Text size="sm" c="dimmed" lineClamp={2}>
                {resource.description}
              </Text>
            </div>
          </Group>

          <Group justify="space-between" align="center">
            <Group gap="xs">
              <Star size={14} fill="gold" color="gold" />
              <Text size="sm" fw={500}>
                {resource.rating}
              </Text>
              <Text size="sm" c="dimmed">
                ({resource.reviewCount})
              </Text>
            </Group>
            <Badge color={resource.isPublic ? 'green' : 'red'} size="sm">
              {resource.isPublic ? 'Public' : 'Private'}
            </Badge>
          </Group>

          <Group gap="xs">
            <Eye size={14} />
            <Text size="sm" c="dimmed">
              {resource.viewCount} views
            </Text>
            <Download size={14} />
            <Text size="sm" c="dimmed">
              {resource.downloadCount} downloads
            </Text>
          </Group>

          {resource.fileSize && (
            <Group gap="xs">
              <File size={14} />
              <Text size="sm" c="dimmed">
                {formatFileSize(resource.fileSize)}
              </Text>
            </Group>
          )}

          {resource.duration && (
            <Group gap="xs">
              <Clock size={14} />
              <Text size="sm" c="dimmed">
                {resource.duration} minutes
              </Text>
            </Group>
          )}

          <Group gap="xs">
            {resource.authorAvatar ? (
              <Avatar src={resource.authorAvatar} size="sm" />
            ) : (
              <User size={14} />
            )}
            <Text size="sm" c="dimmed">
              {resource.author}
            </Text>
          </Group>
        </Stack>

        <Group justify="space-between" align="center">
          <Group gap="xs">
            {resource.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} size="xs" variant="light">
                {tag}
              </Badge>
            ))}
            {resource.tags.length > 2 && (
              <Badge size="xs" variant="light" c="dimmed">
                +{resource.tags.length - 2}
              </Badge>
            )}
          </Group>
          <Group gap="xs">
            <Checkbox
              checked={isSelected}
              onChange={() => onSelect(resource.id)}
              size="sm"
            />
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="light" color="gray">
                  <MoreVertical size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<Eye size={14} />} onClick={() => onView(resource)}>
                  View Details
                </Menu.Item>
                <Menu.Item leftSection={<Edit size={14} />} onClick={() => onEdit(resource)}>
                  Edit Resource
                </Menu.Item>
                {resource.fileUrl && (
                  <Menu.Item leftSection={<Download size={14} />} onClick={() => onDownload(resource)}>
                    Download
                  </Menu.Item>
                )}
                <Menu.Item leftSection={<Copy size={14} />} onClick={() => onDuplicate(resource)}>
                  Duplicate
                </Menu.Item>
                <Menu.Item leftSection={<Share size={14} />}>
                  Share
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item 
                  leftSection={<Trash2 size={14} />} 
                  color="red"
                  onClick={() => onDelete(resource)}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * Resource Table Row Component
 */
interface ResourceTableRowProps {
  resource: Resource;
  onView: (resource: Resource) => void;
  onEdit: (resource: Resource) => void;
  onDownload: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
  onDuplicate: (resource: Resource) => void;
  isSelected: boolean;
  onSelect: (resourceId: string) => void;
}

const ResourceTableRow: React.FC<ResourceTableRowProps> = ({ 
  resource, 
  onView, 
  onEdit, 
  onDownload, 
  onDelete, 
  onDuplicate, 
  isSelected, 
  onSelect 
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText size={16} />;
      case 'video':
        return <Video size={16} />;
      case 'image':
        return <ImageIcon size={16} />;
      case 'article':
        return <BookOpen size={16} />;
      case 'guide':
        return <BookOpen size={16} />;
      case 'form':
        return <File size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'patient-education':
        return 'blue';
      case 'provider-training':
        return 'green';
      case 'policies':
        return 'red';
      case 'forms':
        return 'orange';
      case 'marketing':
        return 'purple';
      case 'research':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="sm">
          {resource.thumbnailUrl && (
            <Image
              src={resource.thumbnailUrl}
              width={40}
              height={40}
              radius="sm"
              alt={resource.title}
            />
          )}
          <div>
            <Text fw={500} size="sm" lineClamp={1}>
              {resource.title}
            </Text>
            <Text size="xs" c="dimmed" lineClamp={1}>
              {resource.description}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          {getTypeIcon(resource.type)}
          <Text size="sm" tt="capitalize">
            {resource.type}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge color={getCategoryColor(resource.category)} size="sm">
          {resource.category.replace('-', ' ')}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{resource.author}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Badge color={resource.isPublic ? 'green' : 'red'} size="sm">
            {resource.isPublic ? 'Public' : 'Private'}
          </Badge>
          {resource.isFeatured && (
            <Badge color="yellow" size="sm">
              Featured
            </Badge>
          )}
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Star size={14} fill="gold" color="gold" />
          <Text size="sm">{resource.rating}</Text>
          <Text size="xs" c="dimmed">({resource.reviewCount})</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{resource.viewCount.toLocaleString()}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{resource.downloadCount.toLocaleString()}</Text>
      </Table.Td>
      <Table.Td>
        {resource.fileSize && (
          <Text size="sm">{formatFileSize(resource.fileSize)}</Text>
        )}
        {resource.duration && (
          <Text size="sm">{resource.duration} min</Text>
        )}
      </Table.Td>
      <Table.Td>
        <Text size="sm">{new Date(resource.createdAt).toLocaleDateString()}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Checkbox
            checked={isSelected}
            onChange={() => onSelect(resource.id)}
            size="sm"
          />
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="light" color="gray" size="sm">
                <MoreVertical size={14} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<Eye size={12} />} onClick={() => onView(resource)}>
                View Details
              </Menu.Item>
              <Menu.Item leftSection={<Edit size={12} />} onClick={() => onEdit(resource)}>
                Edit Resource
              </Menu.Item>
              {resource.fileUrl && (
                <Menu.Item leftSection={<Download size={12} />} onClick={() => onDownload(resource)}>
                  Download
                </Menu.Item>
              )}
              <Menu.Item leftSection={<Copy size={12} />} onClick={() => onDuplicate(resource)}>
                Duplicate
              </Menu.Item>
              <Menu.Item leftSection={<Share size={12} />}>
                Share
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                leftSection={<Trash2 size={12} />} 
                color="red"
                onClick={() => onDelete(resource)}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};

/**
 * Resource Details Modal
 */
interface ResourceDetailsModalProps {
  resource: Resource | null;
  opened: boolean;
  onClose: () => void;
}

const ResourceDetailsModal: React.FC<ResourceDetailsModalProps> = ({ resource, opened, onClose }) => {
  if (!resource) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={resource.title}
      size="lg"
    >
      <Stack gap="md">
        {resource.thumbnailUrl && (
          <Image
            src={resource.thumbnailUrl}
            height={200}
            alt={resource.title}
            radius="md"
          />
        )}

        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={3}>{resource.title}</Title>
            <Text c="dimmed" mt={4}>
              {resource.description}
            </Text>
            <Group gap="xs" mt="xs">
              <Badge color="blue">{resource.type}</Badge>
              <Badge color="green">{resource.category}</Badge>
              {resource.isFeatured && <Badge color="yellow">Featured</Badge>}
              <Badge color={resource.isPublic ? 'green' : 'red'}>
                {resource.isPublic ? 'Public' : 'Private'}
              </Badge>
            </Group>
          </div>
        </Group>

        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="details">Details</Tabs.Tab>
            <Tabs.Tab value="stats">Statistics</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <Stack gap="md">
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text fw={500}>Resource Information</Text>
                    <Text size="sm">
                      <strong>Type:</strong> {resource.type}
                    </Text>
                    <Text size="sm">
                      <strong>Category:</strong> {resource.category}
                    </Text>
                    <Text size="sm">
                      <strong>Language:</strong> {resource.language}
                    </Text>
                    <Text size="sm">
                      <strong>Author:</strong> {resource.author}
                    </Text>
                    {resource.fileSize && (
                      <Text size="sm">
                        <strong>File size:</strong> {formatFileSize(resource.fileSize)}
                      </Text>
                    )}
                    {resource.duration && (
                      <Text size="sm">
                        <strong>Duration:</strong> {resource.duration} minutes
                      </Text>
                    )}
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text fw={500}>Performance</Text>
                    <Group gap="xs">
                      <Star size={16} fill="gold" color="gold" />
                      <Text size="sm">
                        {resource.rating} ({resource.reviewCount} reviews)
                      </Text>
                    </Group>
                    <Text size="sm">
                      <strong>Views:</strong> {resource.viewCount}
                    </Text>
                    <Text size="sm">
                      <strong>Downloads:</strong> {resource.downloadCount}
                    </Text>
                    <Text size="sm">
                      <strong>Visibility:</strong> {resource.isPublic ? 'Public' : 'Private'}
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>

              <div>
                <Text fw={500} mb="xs">Tags</Text>
                <Group gap="xs">
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="light">
                      {tag}
                    </Badge>
                  ))}
                </Group>
              </div>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="details" pt="md">
            <Stack gap="md">
              <Text size="sm">
                <strong>Created:</strong> {resource.createdAt}
              </Text>
              <Text size="sm">
                <strong>Last updated:</strong> {resource.lastUpdated}
              </Text>
              {resource.fileUrl && (
                <div>
                  <Text fw={500} mb="xs">File Information</Text>
                  <Group gap="xs">
                    <Anchor href={resource.fileUrl} target="_blank">
                      View/Download File
                    </Anchor>
                  </Group>
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
                      <Text size="sm" c="dimmed">Total Views</Text>
                      <Eye size={16} />
                    </Group>
                    <Text fw={700} size="xl">{resource.viewCount}</Text>
                  </Card>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Card withBorder padding="md">
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="dimmed">Downloads</Text>
                      <Download size={16} />
                    </Group>
                    <Text fw={700} size="xl">{resource.downloadCount}</Text>
                  </Card>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Card withBorder padding="md">
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="dimmed">Rating</Text>
                      <Star size={16} />
                    </Group>
                    <Text fw={700} size="xl">{resource.rating}</Text>
                  </Card>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Card withBorder padding="md">
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="dimmed">Reviews</Text>
                      <Heart size={16} />
                    </Group>
                    <Text fw={700} size="xl">{resource.reviewCount}</Text>
                  </Card>
                </Grid.Col>
              </Grid>

              <div>
                <Text fw={500} mb="xs">Engagement Rate</Text>
                <Progress
                  value={(resource.downloadCount / resource.viewCount) * 100}
                  size="lg"
                  radius="md"
                />
              </div>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
          {resource.fileUrl && (
            <Button leftSection={<Download size={16} />}>
              Download
            </Button>
          )}
          <Button leftSection={<Edit size={16} />}>
            Edit Resource
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Resource Form Modal
 */
interface ResourceFormModalProps {
  resource: Resource | null;
  opened: boolean;
  onClose: () => void;
  onSave: (resource: Partial<Resource>) => void;
}

const ResourceFormModal: React.FC<ResourceFormModalProps> = ({ resource, opened, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document' as Resource['type'],
    category: 'patient-education' as Resource['category'],
    isPublic: true,
    isFeatured: false,
    tags: [] as string[],
    language: 'English',
  });

  React.useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title,
        description: resource.description,
        type: resource.type,
        category: resource.category,
        isPublic: resource.isPublic,
        isFeatured: resource.isFeatured,
        tags: resource.tags,
        language: resource.language,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'document',
        category: 'patient-education',
        isPublic: true,
        isFeatured: false,
        tags: [],
        language: 'English',
      });
    }
  }, [resource]);

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={resource ? 'Edit Resource' : 'Add New Resource'}
      size="lg"
    >
      <Stack gap="md">
        <TextInput
          label="Title"
          placeholder="Enter resource title"
          value={formData.title}
          onChange={(event) => setFormData({ ...formData, title: event.currentTarget.value })}
          required
        />

        <Textarea
          label="Description"
          placeholder="Enter resource description"
          value={formData.description}
          onChange={(event) => setFormData({ ...formData, description: event.currentTarget.value })}
          minRows={3}
          required
        />

        <Grid>
          <Grid.Col span={6}>
            <Select
              label="Type"
              data={[
                { value: 'document', label: 'Document' },
                { value: 'video', label: 'Video' },
                { value: 'image', label: 'Image' },
                { value: 'article', label: 'Article' },
                { value: 'guide', label: 'Guide' },
                { value: 'form', label: 'Form' },
              ]}
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value as Resource['type'] })}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Category"
              data={[
                { value: 'patient-education', label: 'Patient Education' },
                { value: 'provider-training', label: 'Provider Training' },
                { value: 'policies', label: 'Policies' },
                { value: 'forms', label: 'Forms' },
                { value: 'marketing', label: 'Marketing' },
                { value: 'research', label: 'Research' },
              ]}
              value={formData.category}
              onChange={(value) => setFormData({ ...formData, category: value as Resource['category'] })}
              required
            />
          </Grid.Col>
        </Grid>

        <TextInput
          label="Language"
          placeholder="Enter language"
          value={formData.language}
          onChange={(event) => setFormData({ ...formData, language: event.currentTarget.value })}
        />

        <FileInput
          label="Upload File"
          placeholder="Choose file to upload"
          accept=".pdf,.doc,.docx,.mp4,.mov,.jpg,.jpeg,.png"
        />

        <Group>
          <Switch
            label="Public"
            checked={formData.isPublic}
            onChange={(event) => setFormData({ ...formData, isPublic: event.currentTarget.checked })}
          />
          <Switch
            label="Featured"
            checked={formData.isFeatured}
            onChange={(event) => setFormData({ ...formData, isFeatured: event.currentTarget.checked })}
          />
        </Group>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {resource ? 'Update Resource' : 'Create Resource'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

/**
 * Main Resources Page Component
 * Purpose: Manage resources UI and interactions. Fix Mantine Text type errors by using `ta` for text alignment.
 * Inputs: None (local state and mock data).
 * Outputs: Renders the Resources management page including summary metrics, filters, tables, and modals.
 */
export const ResourcesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [visibilityFilter, setVisibilityFilter] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Convert mock data to stateful for real resource management
  const [resources, setResources] = useState<Resource[]>(mockResources);

  const handleViewResource = (resource: Resource) => {
    setSelectedResource(resource);
    openDetails();
  };

  const handleEditResource = (resource: Resource) => {
    setSelectedResource(resource);
    openForm();
  };

  const handleCreateResource = () => {
    setSelectedResource(null);
    openForm();
  };

  const handleDownloadResource = async (resource: Resource) => {
    if (resource.fileUrl) {
      setIsLoading(true);
      try {
        // Simulate file download
        const link = document.createElement('a');
        link.href = resource.fileUrl;
        link.download = `${resource.title}.${resource.type === 'document' ? 'pdf' : resource.type === 'video' ? 'mp4' : 'file'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Update download count
        setResources(prev => prev.map(r => 
          r.id === resource.id 
            ? { ...r, downloadCount: r.downloadCount + 1 }
            : r
        ));
        
        setNotification({ type: 'success', message: `${resource.title} downloaded successfully!` });
      } catch (error) {
        setNotification({ type: 'error', message: 'Failed to download resource. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveResource = async (resourceData: Partial<Resource>) => {
    setIsLoading(true);
    try {
      if (selectedResource) {
        // Edit existing resource
        setResources(prev => prev.map(r => 
          r.id === selectedResource.id 
            ? { ...r, ...resourceData, lastUpdated: new Date().toISOString().split('T')[0] }
            : r
        ));
        setNotification({ type: 'success', message: 'Resource updated successfully!' });
      } else {
        // Create new resource
        const newResource: Resource = {
          id: `RES-${String(resources.length + 1).padStart(3, '0')}`,
          title: resourceData.title || '',
          description: resourceData.description || '',
          type: resourceData.type || 'document',
          category: resourceData.category || 'patient-education',
          fileUrl: resourceData.fileUrl,
          thumbnailUrl: resourceData.thumbnailUrl,
          fileSize: resourceData.fileSize,
          duration: resourceData.duration,
          isPublic: resourceData.isPublic || false,
          isFeatured: resourceData.isFeatured || false,
          tags: resourceData.tags || [],
          viewCount: 0,
          downloadCount: 0,
          rating: 0,
          reviewCount: 0,
          author: resourceData.author || 'Current User',
          authorAvatar: resourceData.authorAvatar,
          createdAt: new Date().toISOString().split('T')[0],
          lastUpdated: new Date().toISOString().split('T')[0],
          language: resourceData.language || 'English',
        };
        setResources(prev => [...prev, newResource]);
        setNotification({ type: 'success', message: 'Resource created successfully!' });
      }
      closeForm();
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save resource. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    setIsLoading(true);
    try {
      setResources(prev => prev.filter(r => r.id !== resourceId));
      setNotification({ type: 'success', message: 'Resource deleted successfully!' });
      closeDelete();
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to delete resource. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateResource = async (resource: Resource) => {
    setIsLoading(true);
    try {
      const duplicatedResource: Resource = {
        ...resource,
        id: `RES-${String(resources.length + 1).padStart(3, '0')}`,
        title: `${resource.title} (Copy)`,
        viewCount: 0,
        downloadCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      setResources(prev => [...prev, duplicatedResource]);
      setNotification({ type: 'success', message: 'Resource duplicated successfully!' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to duplicate resource. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedResources.length === 0) return;
    
    setIsLoading(true);
    try {
      setResources(prev => prev.filter(r => !selectedResources.includes(r.id)));
      setSelectedResources([]);
      setNotification({ type: 'success', message: `${selectedResources.length} resources deleted successfully!` });
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to delete resources. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkStatusChange = async (isPublic: boolean) => {
    if (selectedResources.length === 0) return;
    
    setIsLoading(true);
    try {
      setResources(prev => prev.map(r => 
        selectedResources.includes(r.id) 
          ? { ...r, isPublic, lastUpdated: new Date().toISOString().split('T')[0] }
          : r
      ));
      setSelectedResources([]);
      setNotification({ 
        type: 'success', 
        message: `${selectedResources.length} resources ${isPublic ? 'made public' : 'made private'} successfully!` 
      });
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to update resource status. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['ID', 'Title', 'Type', 'Category', 'Author', 'Views', 'Downloads', 'Rating', 'Created', 'Status'],
      ...filteredResources.map(r => [
        r.id,
        r.title,
        r.type,
        r.category,
        r.author,
        r.viewCount,
        r.downloadCount,
        r.rating,
        r.createdAt,
        r.isPublic ? 'Public' : 'Private'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resources-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    setNotification({ type: 'success', message: 'Resources exported to CSV successfully!' });
  };

  const toggleResourceSelection = (resourceId: string) => {
    setSelectedResources(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const toggleAllResourcesSelection = () => {
    if (selectedResources.length === filteredResources.length) {
      setSelectedResources([]);
    } else {
      setSelectedResources(filteredResources.map(r => r.id));
    }
  };

  const filteredResources = resources
    .filter(resource =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(resource => !typeFilter || resource.type === typeFilter)
    .filter(resource => !categoryFilter || resource.category === categoryFilter)
    .filter(resource => {
      if (visibilityFilter === 'public') return resource.isPublic;
      if (visibilityFilter === 'private') return !resource.isPublic;
      if (visibilityFilter === 'featured') return resource.isFeatured;
      return true;
    });

  // Calculate summary statistics
  const totalResources = resources.length;
  const publicResources = resources.filter(r => r.isPublic).length;
  const totalViews = resources.reduce((sum, r) => sum + r.viewCount, 0);
  const totalDownloads = resources.reduce((sum, r) => sum + r.downloadCount, 0);

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Resources &amp; Content</Title>
            <Text c="dimmed">Manage educational resources, documents, and content library</Text>
          </div>
          <Button leftSection={<Plus size={16} />} onClick={handleCreateResource}>
            Add Resource
          </Button>
        </Group>

        {/* Summary Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Total Resources
                </Text>
                <ThemeIcon variant="light" color="blue" size="lg">
                  <FileText size={20} />
                </ThemeIcon>
              </Group>
              <Text fw={700} size="xl" c="blue" className="summary-card-metric">
                {totalResources}
              </Text>
              {/* Mantine Text alignment fix: use `ta` instead of `align` */}
              <Text size="xs" c="dimmed" ta="center">
                In library
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Public Resources
                </Text>
                <ThemeIcon variant="light" color="green" size="lg">
                  <Users size={20} />
                </ThemeIcon>
              </Group>
              <Text fw={700} size="xl" c="green" className="summary-card-metric">
                {publicResources}
              </Text>
              {/* Mantine Text alignment fix: use `ta` instead of `align` */}
              <Text size="xs" c="dimmed" ta="center">
                Available to patients
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Total Views
                </Text>
                <ThemeIcon variant="light" color="orange" size="lg">
                  <Eye size={20} />
                </ThemeIcon>
              </Group>
              <Text fw={700} size="xl" c="orange" className="summary-card-metric">
                {totalViews.toLocaleString()}
              </Text>
              {/* Mantine Text alignment fix: use `ta` instead of `align` */}
              <Text size="xs" c="dimmed" ta="center">
                Page views
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  Total Downloads
                </Text>
                <ThemeIcon variant="light" color="purple" size="lg">
                  <Download size={20} />
                </ThemeIcon>
              </Group>
              <Text fw={700} size="xl" c="purple" className="summary-card-metric">
                {totalDownloads.toLocaleString()}
              </Text>
              {/* Mantine Text alignment fix: use `ta` instead of `align` */}
              <Text size="xs" c="dimmed" ta="center">
                File downloads
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Filters and Bulk Actions */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Grid align="end">
              <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                <TextInput
                  placeholder="Search resources..."
                  leftSection={<Search size={16} />}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.currentTarget.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                <Select
                  placeholder="Filter by type"
                  leftSection={<Filter size={16} />}
                  data={[
                    { value: 'document', label: 'Document' },
                    { value: 'video', label: 'Video' },
                    { value: 'image', label: 'Image' },
                    { value: 'article', label: 'Article' },
                    { value: 'guide', label: 'Guide' },
                    { value: 'form', label: 'Form' },
                  ]}
                  value={typeFilter}
                  onChange={setTypeFilter}
                  clearable
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                <Select
                  placeholder="Filter by category"
                  leftSection={<BookOpen size={16} />}
                  data={[
                    { value: 'patient-education', label: 'Patient Education' },
                    { value: 'provider-training', label: 'Provider Training' },
                    { value: 'policies', label: 'Policies' },
                    { value: 'forms', label: 'Forms' },
                    { value: 'marketing', label: 'Marketing' },
                    { value: 'research', label: 'Research' },
                  ]}
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  clearable
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                <Select
                  placeholder="Filter by visibility"
                  leftSection={<TrendingUp size={16} />}
                  data={[
                    { value: 'public', label: 'Public' },
                    { value: 'private', label: 'Private' },
                    { value: 'featured', label: 'Featured' },
                  ]}
                  value={visibilityFilter}
                  onChange={setVisibilityFilter}
                  clearable
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
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

            {/* Search Results Count */}
            <Group justify="space-between" align="center">
              <Text size="sm" c="dimmed">
                Showing {filteredResources.length} of {resources.length} resources
              </Text>
              <Group gap="xs">
                <Button
                  leftSection={<Upload size={14} />}
                  variant="light"
                  size="sm"
                  onClick={handleExportCSV}
                >
                  Export CSV
                </Button>
              </Group>
            </Group>

            {/* Bulk Actions */}
            {selectedResources.length > 0 && (
              <Group justify="space-between" align="center" p="sm" style={{ backgroundColor: 'var(--mantine-color-blue-0)', borderRadius: 'var(--mantine-radius-sm)' }}>
                <Text size="sm" fw={500}>
                  {selectedResources.length} resource{selectedResources.length > 1 ? 's' : ''} selected
                </Text>
                <Group gap="xs">
                  <Button
                    leftSection={<Eye size={14} />}
                    variant="light"
                    size="sm"
                    onClick={() => handleBulkStatusChange(true)}
                  >
                    Make Public
                  </Button>
                  <Button
                    leftSection={<Eye size={14} />}
                    variant="light"
                    size="sm"
                    onClick={() => handleBulkStatusChange(false)}
                  >
                    Make Private
                  </Button>
                  <Button
                    leftSection={<Trash2 size={14} />}
                    color="red"
                    variant="light"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    Delete Selected
                  </Button>
                </Group>
              </Group>
            )}
          </Stack>
        </Card>

        {/* Resources Display */}
        {isLoading ? (
          <Center py="xl">
            <Loader size="lg" />
          </Center>
        ) : viewMode === 'cards' ? (
          <Grid>
            {filteredResources.map((resource) => (
              <Grid.Col key={resource.id} span={{ base: 12, sm: 6, lg: 4 }}>
                <ResourceCard
                  resource={resource}
                  onView={handleViewResource}
                  onEdit={handleEditResource}
                  onDownload={handleDownloadResource}
                  onDelete={(resource) => handleDeleteResource(resource.id)}
                  onDuplicate={handleDuplicateResource}
                  isSelected={selectedResources.includes(resource.id)}
                  onSelect={toggleResourceSelection}
                />
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    <Checkbox
                      checked={selectedResources.length === filteredResources.length && filteredResources.length > 0}
                      indeterminate={selectedResources.length > 0 && selectedResources.length < filteredResources.length}
                      onChange={toggleAllResourcesSelection}
                    />
                  </Table.Th>
                  <Table.Th>Resource</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Author</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Rating</Table.Th>
                  <Table.Th>Views</Table.Th>
                  <Table.Th>Downloads</Table.Th>
                  <Table.Th>Size/Duration</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredResources.map((resource) => (
                  <ResourceTableRow
                    key={resource.id}
                    resource={resource}
                    onView={handleViewResource}
                    onEdit={handleEditResource}
                    onDownload={handleDownloadResource}
                    onDelete={(resource) => handleDeleteResource(resource.id)}
                    onDuplicate={handleDuplicateResource}
                    isSelected={selectedResources.includes(resource.id)}
                    onSelect={toggleResourceSelection}
                  />
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && filteredResources.length === 0 && (
          <Center py="xl">
            <Stack align="center" gap="md">
              <FileText size={48} color="gray" />
              <Text size="lg" c="dimmed">
                No resources found
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                {searchQuery || typeFilter || categoryFilter || visibilityFilter
                  ? 'Try adjusting your search criteria'
                  : 'Get started by adding your first resource'}
              </Text>
              <Button leftSection={<Plus size={16} />} onClick={handleCreateResource}>
                Add Resource
              </Button>
            </Stack>
          </Center>
        )}
      </Stack>

      {/* Notification */}
      {notification && (
        <Notification
          icon={notification.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
          color={notification.type === 'success' ? 'green' : 'red'}
          title={notification.type === 'success' ? 'Success' : 'Error'}
          onClose={() => setNotification(null)}
          style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}
        >
          {notification.message}
        </Notification>
      )}

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteOpened} onClose={closeDelete} title="Delete Resource">
        <Text>Are you sure you want to delete this resource? This action cannot be undone.</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={closeDelete}>
            Cancel
          </Button>
          <Button color="red" onClick={() => {
            if (selectedResource) {
              handleDeleteResource(selectedResource.id);
            }
            closeDelete();
          }}>
            Delete
          </Button>
        </Group>
      </Modal>

      {/* Resource Details Modal */}
      <ResourceDetailsModal
        resource={selectedResource}
        opened={detailsOpened}
        onClose={closeDetails}
      />

      {/* Resource Form Modal */}
      <ResourceFormModal
        resource={selectedResource}
        opened={formOpened}
        onClose={closeForm}
        onSave={handleSaveResource}
      />
    </Container>
  );
};