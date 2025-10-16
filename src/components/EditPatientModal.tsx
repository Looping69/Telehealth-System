/**
 * Edit Patient Modal Component
 * Form for editing existing patients with pre-populated fields
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  Grid,
  TextInput,
  Select,
  Button,
  Group,
  Title,
  Divider,
  Text,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Patient } from '../types';

interface EditPatientModalProps {
  opened: boolean;
  onClose: () => void;
  patient: Patient | null;
}

interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  gender: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
  emergencyContact: string;
  emergencyPhone: string;
}

export const EditPatientModal = ({
  opened,
  onClose,
  patient,
}: EditPatientModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PatientFormData>({
    initialValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: null,
      gender: '',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
      insurance: {
        provider: '',
        policyNumber: '',
        groupNumber: '',
      },
      emergencyContact: '',
      emergencyPhone: '',
    },
    validate: {
      firstName: (value: string) => (value.length < 2 ? 'First name must have at least 2 letters' : null),
      lastName: (value: string) => (value.length < 2 ? 'Last name must have at least 2 letters' : null),
      dateOfBirth: (value: Date | null) => (!value ? 'Date of birth is required' : null),
      gender: (value: string) => (!value ? 'Gender is required' : null),
      phone: (value: string) => (!/^\(\d{3}\) \d{3}-\d{4}$/.test(value) && value.length > 0 ? 'Phone must be in format (123) 456-7890' : null),
      email: (value: string) => (!/^\S+@\S+$/.test(value) && value.length > 0 ? 'Invalid email' : null),
      address: {
        street: (value: string) => (value.length < 5 ? 'Street address is required' : null),
        city: (value: string) => (value.length < 2 ? 'City is required' : null),
        state: (value: string) => (!value ? 'State is required' : null),
        zipCode: (value: string) => (!/^\d{5}(-\d{4})?$/.test(value) ? 'ZIP code must be 5 digits or 5+4 format' : null),
      },
      emergencyContact: (value: string) => (value.length < 2 ? 'Emergency contact name is required' : null),
      emergencyPhone: (value: string) => (!/^\(\d{3}\) \d{3}-\d{4}$/.test(value) ? 'Emergency phone must be in format (123) 456-7890' : null),
    },
  });

  // Pre-populate form when patient data changes
  useEffect(() => {
    if (patient && opened) {
      form.setValues({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth) : null,
        gender: patient.gender || '',
        phone: patient.phone || '',
        email: patient.email || '',
        address: {
          street: typeof patient.address === 'object' ? patient.address?.street || '' : '',
          city: typeof patient.address === 'object' ? patient.address?.city || '' : '',
          state: typeof patient.address === 'object' ? patient.address?.state || '' : '',
          zipCode: typeof patient.address === 'object' ? patient.address?.zipCode || '' : '',
        },
        insurance: {
          provider: typeof patient.insurance === 'object' ? patient.insurance?.provider || '' : '',
          policyNumber: typeof patient.insurance === 'object' ? patient.insurance?.policyNumber || '' : '',
          groupNumber: typeof patient.insurance === 'object' ? patient.insurance?.groupNumber || '' : '',
        },
        emergencyContact: patient.emergencyContact || '',
        emergencyPhone: '',
      });
    }
  }, [patient, opened]);

  const handleSubmit = async (values: PatientFormData) => {
    if (!patient) return;
    
    setIsSubmitting(true);
    try {
      // TODO: Implement actual patient update API call
      console.log('Updating patient:', { id: patient.id, ...values });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      notifications.show({
        title: 'Success',
        message: 'Patient updated successfully',
        color: 'green',
      });
      
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update patient',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={<Title order={3}>Edit Patient</Title>}
      size="xl"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          {/* Personal Information */}
          <div>
            <Text fw={500} mb="sm">Personal Information</Text>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="First Name"
                  placeholder="Enter first name"
                  required
                  {...form.getInputProps('firstName')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Last Name"
                  placeholder="Enter last name"
                  required
                  {...form.getInputProps('lastName')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <DateInput
                  label="Date of Birth"
                  placeholder="Select date of birth"
                  required
                  maxDate={new Date()}
                  {...form.getInputProps('dateOfBirth')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Gender"
                  placeholder="Select gender"
                  required
                  data={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
                  ]}
                  {...form.getInputProps('gender')}
                />
              </Grid.Col>
            </Grid>
          </div>

          <Divider />

          {/* Contact Information */}
          <div>
            <Text fw={500} mb="sm">Contact Information</Text>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Phone Number"
                  placeholder="(123) 456-7890"
                  {...form.getInputProps('phone')}
                  onChange={(event) => {
                    const formatted = formatPhoneNumber(event.currentTarget.value);
                    form.setFieldValue('phone', formatted);
                  }}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Email Address"
                  placeholder="patient@example.com"
                  type="email"
                  {...form.getInputProps('email')}
                />
              </Grid.Col>
            </Grid>
          </div>

          <Divider />

          {/* Address Information */}
          <div>
            <Text fw={500} mb="sm">Address Information</Text>
            <Grid>
              <Grid.Col span={12}>
                <TextInput
                  label="Street Address"
                  placeholder="123 Main Street"
                  required
                  {...form.getInputProps('address.street')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label="City"
                  placeholder="City"
                  required
                  {...form.getInputProps('address.city')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Select
                  label="State"
                  placeholder="State"
                  required
                  data={states.map(state => ({ value: state, label: state }))}
                  searchable
                  {...form.getInputProps('address.state')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label="ZIP Code"
                  placeholder="12345"
                  required
                  {...form.getInputProps('address.zipCode')}
                />
              </Grid.Col>
            </Grid>
          </div>

          <Divider />

          {/* Insurance Information */}
          <div>
            <Text fw={500} mb="sm">Insurance Information</Text>
            <Grid>
              <Grid.Col span={12}>
                <TextInput
                  label="Insurance Provider"
                  placeholder="Blue Cross Blue Shield"
                  {...form.getInputProps('insurance.provider')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Policy Number"
                  placeholder="Policy number"
                  {...form.getInputProps('insurance.policyNumber')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Group Number"
                  placeholder="Group number"
                  {...form.getInputProps('insurance.groupNumber')}
                />
              </Grid.Col>
            </Grid>
          </div>

          <Divider />

          {/* Emergency Contact */}
          <div>
            <Text fw={500} mb="sm">Emergency Contact</Text>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Emergency Contact Name"
                  placeholder="Contact name"
                  required
                  {...form.getInputProps('emergencyContact')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Emergency Contact Phone"
                  placeholder="(123) 456-7890"
                  required
                  {...form.getInputProps('emergencyPhone')}
                  onChange={(event) => {
                    const formatted = formatPhoneNumber(event.currentTarget.value);
                    form.setFieldValue('emergencyPhone', formatted);
                  }}
                />
              </Grid.Col>
            </Grid>
          </div>

          {/* Form Actions */}
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Update Patient
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};