import React from 'react';
import {
  Modal,
  Stack,
  Grid,
  Text,
  Badge,
  Group,
  Button,
  Card,
} from '@mantine/core';
import {
  Phone,
  Mail,
  MapPin,
  Building,
  Edit,
} from 'lucide-react';

/**
 * Provider Details Modal Component
 * Displays comprehensive provider information including contact details and available plans
 */
interface ProviderDetailsModalProps {
  provider: any;
  opened: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const ProviderDetailsModal: React.FC<ProviderDetailsModalProps> = ({ 
  provider, 
  opened, 
  onClose, 
  onEdit 
}) => {
  if (!provider) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Provider Details - ${provider.name}`}
      size="lg"
    >
      <Stack gap="md">
        <Grid>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Provider Information</Text>
              <Text size="sm">
                <strong>Name:</strong> {provider.name}
              </Text>
              <Text size="sm">
                <strong>Provider ID:</strong> {provider.id}
              </Text>
              <Text size="sm">
                <strong>Type:</strong> {provider.type}
              </Text>
              <Badge color={provider.status === 'active' ? 'green' : 'red'}>
                {provider.status}
              </Badge>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="xs">
              <Text fw={500}>Contact Information</Text>
              <Group gap="xs">
                <Phone size={16} />
                <Text size="sm">{provider.phone}</Text>
              </Group>
              <Group gap="xs">
                <Mail size={16} />
                <Text size="sm">{provider.email}</Text>
              </Group>
              <Group gap="xs">
                <MapPin size={16} />
                <Text size="sm">{provider.address}</Text>
              </Group>
              {provider.website && (
                <Group gap="xs">
                  <Building size={16} />
                  <Text size="sm" component="a" href={provider.website} target="_blank">
                    {provider.website}
                  </Text>
                </Group>
              )}
            </Stack>
          </Grid.Col>
        </Grid>

        {provider.plans && provider.plans.length > 0 && (
          <div>
            <Text fw={500} mb="sm">Available Plans</Text>
            <Stack gap="sm">
              {provider.plans.map((plan: any) => (
                <Card key={plan.id} withBorder padding="sm">
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>{plan.name}</Text>
                    <Badge variant="light">{plan.type}</Badge>
                  </Group>
                  <Grid>
                    <Grid.Col span={6}>
                      <Text size="sm">Deductible: ${plan.deductible}</Text>
                      <Text size="sm">Copay: ${plan.copay}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm">Coinsurance: {plan.coinsurance}%</Text>
                      <Text size="sm">Out-of-Pocket Max: ${plan.outOfPocketMax}</Text>
                    </Grid.Col>
                  </Grid>
                </Card>
              ))}
            </Stack>
          </div>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
          <Button leftSection={<Edit size={16} />} onClick={onEdit}>
            Edit Provider
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ProviderDetailsModal;