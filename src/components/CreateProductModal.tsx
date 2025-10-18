/**
 * CreateProductModal Component
 * Modal for creating new FHIR Medication resources (products)
 */

import React, { useState } from 'react';
import {
  Modal,
  Stack,
  TextInput,
  Select,
  Button,
  Group,
  Alert,
  Text,
  Divider,
  Card,
  ActionIcon,
  Grid,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { AlertCircle, Pill, Plus, X } from 'lucide-react';
import { showNotification } from '@mantine/notifications';
import { useCreateProduct } from '../hooks/useQuery';

interface CreateProductModalProps {
  opened: boolean;
  onClose: () => void;
  onProductCreated?: () => void;
}

interface Ingredient {
  name: string;
  strength: string;
}

/**
 * Modal component for creating new pharmaceutical products
 * @param opened - Whether the modal is open
 * @param onClose - Function to close the modal
 * @param onProductCreated - Optional callback when product is created
 */
const CreateProductModal: React.FC<CreateProductModalProps> = ({
  opened,
  onClose,
  onProductCreated,
}) => {
  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [dosageForm, setDosageForm] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', strength: '' }]);
  const [batchNumber, setBatchNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<'active' | 'inactive' | 'entered-in-error'>('active');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProductMutation = useCreateProduct();

  /**
   * Adds a new ingredient field
   */
  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', strength: '' }]);
  };

  /**
   * Removes an ingredient field
   */
  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  /**
   * Updates an ingredient field
   */
  const updateIngredient = (index: number, field: 'name' | 'strength', value: string) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index][field] = value;
    setIngredients(updatedIngredients);
  };

  /**
   * Handles form submission to create a new product
   */
  const handleSubmit = async () => {
    if (!name.trim()) {
      showNotification({
        title: 'Validation Error',
        message: 'Product name is required',
        color: 'red',
      });
      return;
    }

    // Filter out empty ingredients
    const validIngredients = ingredients.filter(ing => ing.name.trim());

    if (validIngredients.length === 0) {
      showNotification({
        title: 'Validation Error',
        message: 'At least one ingredient is required',
        color: 'red',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createProductMutation.mutateAsync({
        name: name.trim(),
        manufacturer: manufacturer.trim() || undefined,
        dosageForm: dosageForm || undefined,
        ingredients: validIngredients,
        batchNumber: batchNumber.trim() || undefined,
        expirationDate: expirationDate || undefined,
        status,
        description: description.trim() || undefined,
      });

      showNotification({
        title: 'Success',
        message: 'Product created successfully',
        color: 'green',
      });

      // Reset form
      setName('');
      setManufacturer('');
      setDosageForm('');
      setIngredients([{ name: '', strength: '' }]);
      setBatchNumber('');
      setExpirationDate(null);
      setStatus('active');
      setDescription('');
      
      onProductCreated?.();
      onClose();
    } catch (error) {
      console.error('Error creating product:', error);
      showNotification({
        title: 'Error',
        message: `Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`,
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles modal close and resets form
   */
  const handleClose = () => {
    if (!isSubmitting) {
      setName('');
      setManufacturer('');
      setDosageForm('');
      setIngredients([{ name: '', strength: '' }]);
      setBatchNumber('');
      setExpirationDate(null);
      setStatus('active');
      setDescription('');
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Add New Product"
      size="lg"
      closeOnClickOutside={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <Stack gap="md">
        {/* Basic Information */}
        <Card withBorder padding="sm">
          <Stack gap="xs">
            <Text size="sm" fw={500}>Basic Information</Text>
            <Grid>
              <Grid.Col span={12}>
                <TextInput
                  label="Product Name"
                  placeholder="e.g., Amoxicillin, Ibuprofen, Insulin"
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  required
                  disabled={isSubmitting}
                  leftSection={<Pill size={16} />}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Manufacturer"
                  placeholder="e.g., Pfizer, Johnson & Johnson"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.currentTarget.value)}
                  disabled={isSubmitting}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Dosage Form"
                  placeholder="Select dosage form"
                  value={dosageForm}
                  onChange={(value) => setDosageForm(value || '')}
                  data={[
                    { value: 'tablet', label: 'Tablet' },
                    { value: 'capsule', label: 'Capsule' },
                    { value: 'liquid', label: 'Liquid' },
                    { value: 'injection', label: 'Injection' },
                    { value: 'cream', label: 'Cream' },
                    { value: 'ointment', label: 'Ointment' },
                    { value: 'patch', label: 'Patch' },
                    { value: 'inhaler', label: 'Inhaler' },
                  ]}
                  clearable
                  disabled={isSubmitting}
                />
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>

        <Divider />

        {/* Ingredients */}
        <Card withBorder padding="sm">
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" fw={500}>Active Ingredients</Text>
              <Button
                size="xs"
                variant="light"
                leftSection={<Plus size={14} />}
                onClick={addIngredient}
                disabled={isSubmitting}
              >
                Add Ingredient
              </Button>
            </Group>
            
            {ingredients.map((ingredient, index) => (
              <Group key={index} align="flex-end">
                <TextInput
                  label={index === 0 ? "Ingredient Name" : ""}
                  placeholder="e.g., Amoxicillin, Ibuprofen"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.currentTarget.value)}
                  style={{ flex: 2 }}
                  disabled={isSubmitting}
                />
                <TextInput
                  label={index === 0 ? "Strength" : ""}
                  placeholder="e.g., 500 mg, 200 mg"
                  value={ingredient.strength}
                  onChange={(e) => updateIngredient(index, 'strength', e.currentTarget.value)}
                  style={{ flex: 1 }}
                  disabled={isSubmitting}
                />
                {ingredients.length > 1 && (
                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => removeIngredient(index)}
                    disabled={isSubmitting}
                  >
                    <X size={16} />
                  </ActionIcon>
                )}
              </Group>
            ))}
          </Stack>
        </Card>

        <Divider />

        {/* Batch Information */}
        <Card withBorder padding="sm">
          <Stack gap="xs">
            <Text size="sm" fw={500}>Batch Information</Text>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Batch Number (Optional)"
                  placeholder="e.g., LOT123456"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.currentTarget.value)}
                  disabled={isSubmitting}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <DateInput
                  label="Expiration Date (Optional)"
                  placeholder="Select expiration date"
                  value={expirationDate}
                  onChange={setExpirationDate}
                  minDate={new Date()}
                  disabled={isSubmitting}
                />
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>

        <Divider />

        {/* Status and Description */}
        <Grid>
          <Grid.Col span={6}>
            <Select
              label="Status"
              value={status}
              onChange={(value) => setStatus(value as 'active' | 'inactive' | 'entered-in-error')}
              data={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'entered-in-error', label: 'Entered in Error' },
              ]}
              disabled={isSubmitting}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Description (Optional)"
              placeholder="Additional product description"
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              disabled={isSubmitting}
            />
          </Grid.Col>
        </Grid>

        {/* FHIR Information */}
        <Alert icon={<AlertCircle size={16} />} color="blue" variant="light">
          This will create a FHIR Medication resource in the Medplum database with RxNorm and SNOMED CT coding.
        </Alert>

        {/* Action Buttons */}
        <Group justify="flex-end" gap="sm">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!name.trim() || ingredients.every(ing => !ing.name.trim())}
          >
            Create Product
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default CreateProductModal;