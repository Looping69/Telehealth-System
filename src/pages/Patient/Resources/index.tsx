import React, { useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Group, 
  Stack, 
  Grid, 
  Badge,
  Tabs,
  Image,
  Accordion,
  ActionIcon,
  Modal,
  AspectRatio,
  ScrollArea
} from '@mantine/core';
import { 
  IconBook, 
  IconVideo, 
  IconQuestionMark, 
  IconSearch, 
  IconPlayerPlay,
  IconDownload,
  IconBookmark,
  IconShare,
  IconClock,
  IconUser,
  IconChevronRight
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { PatientCard, PatientButton, PatientTextInput } from '../../../components/patient';

/**
 * PatientResources Component
 * 
 * Purpose: Educational content library for GLP-1 patients
 * Features:
 * - Educational articles and guides
 * - Video content library
 * - FAQ section
 * - Search functionality
 * - Bookmarking and sharing
 * - Progress tracking for educational content
 * 
 * Inputs: None (uses patient context from auth store)
 * Outputs: Renders educational resources interface with content library
 */
const PatientResources: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('articles');
  const [searchQuery, setSearchQuery] = useState('');
  const [videoModalOpened, { open: openVideoModal, close: closeVideoModal }] = useDisclosure(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  // Mock educational content - will be replaced with CMS integration
  const articles = [
    {
      id: 1,
      title: 'Understanding GLP-1 Medications',
      category: 'Medication',
      readTime: '5 min read',
      author: 'Dr. Sarah Johnson',
      excerpt: 'Learn how GLP-1 receptor agonists work to help manage diabetes and support weight loss.',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=medical%20illustration%20of%20GLP-1%20medication%20injection%20pen%20on%20clean%20white%20background%20professional%20healthcare%20style&image_size=landscape_4_3',
      bookmarked: true,
      completed: true
    },
    {
      id: 2,
      title: 'Nutrition Guidelines for GLP-1 Treatment',
      category: 'Nutrition',
      readTime: '8 min read',
      author: 'Nutritionist Lisa Chen',
      excerpt: 'Discover the best dietary practices to maximize the benefits of your GLP-1 treatment.',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=healthy%20meal%20plate%20with%20vegetables%20lean%20protein%20whole%20grains%20colorful%20nutritious%20food%20clean%20background&image_size=landscape_4_3',
      bookmarked: false,
      completed: false
    },
    {
      id: 3,
      title: 'Managing Side Effects',
      category: 'Side Effects',
      readTime: '6 min read',
      author: 'Dr. Michael Rodriguez',
      excerpt: 'Common side effects of GLP-1 medications and practical strategies to manage them.',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=healthcare%20professional%20consulting%20with%20patient%20about%20medication%20side%20effects%20medical%20office%20setting&image_size=landscape_4_3',
      bookmarked: true,
      completed: false
    },
    {
      id: 4,
      title: 'Exercise and Physical Activity',
      category: 'Lifestyle',
      readTime: '7 min read',
      author: 'Fitness Coach Amanda White',
      excerpt: 'Safe and effective exercise routines to complement your GLP-1 treatment plan.',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=person%20doing%20light%20exercise%20walking%20stretching%20healthy%20lifestyle%20outdoor%20setting%20motivational&image_size=landscape_4_3',
      bookmarked: false,
      completed: false
    }
  ];

  const videos = [
    {
      id: 1,
      title: 'How to Inject GLP-1 Medication',
      duration: '3:45',
      category: 'Tutorial',
      instructor: 'Nurse Practitioner Jane Smith',
      thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=medical%20professional%20demonstrating%20injection%20technique%20educational%20video%20thumbnail%20healthcare%20setting&image_size=landscape_16_9',
      description: 'Step-by-step guide for proper injection technique and site rotation.',
      watched: true
    },
    {
      id: 2,
      title: 'Meal Planning for Weight Management',
      duration: '12:30',
      category: 'Nutrition',
      instructor: 'Dietitian Robert Kim',
      thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=nutritionist%20preparing%20healthy%20meal%20plan%20kitchen%20setting%20educational%20content%20professional%20lighting&image_size=landscape_16_9',
      description: 'Learn to create balanced meals that support your treatment goals.',
      watched: false
    },
    {
      id: 3,
      title: 'Understanding Your Progress Metrics',
      duration: '8:15',
      category: 'Monitoring',
      instructor: 'Dr. Patricia Lee',
      thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=doctor%20explaining%20medical%20charts%20and%20progress%20tracking%20professional%20medical%20office%20educational&image_size=landscape_16_9',
      description: 'How to interpret your health metrics and track treatment progress.',
      watched: false
    }
  ];

  const faqs = [
    {
      question: 'How long does it take to see results with GLP-1 medication?',
      answer: 'Most patients begin to see weight loss within 4-6 weeks of starting treatment. Blood sugar improvements may be noticed sooner, often within the first 2 weeks. Individual results vary based on factors like diet, exercise, and adherence to the medication schedule.'
    },
    {
      question: 'What should I do if I miss a dose?',
      answer: 'If you miss a dose and it\'s within 5 days of your scheduled injection, take it as soon as you remember. If more than 5 days have passed, skip the missed dose and resume your regular schedule. Never take two doses at once.'
    },
    {
      question: 'Can I drink alcohol while on GLP-1 medication?',
      answer: 'Moderate alcohol consumption is generally acceptable, but alcohol can affect blood sugar levels and may increase the risk of hypoglycemia. Discuss your alcohol consumption with your healthcare provider to ensure it\'s safe for your specific situation.'
    },
    {
      question: 'What are the most common side effects?',
      answer: 'The most common side effects include nausea, vomiting, diarrhea, and decreased appetite. These typically improve over time as your body adjusts to the medication. Starting with a lower dose and gradually increasing can help minimize side effects.'
    },
    {
      question: 'How should I store my medication?',
      answer: 'Store unopened pens in the refrigerator between 36-46°F (2-8°C). Once in use, the pen can be stored at room temperature (below 86°F/30°C) for up to 28 days. Never freeze the medication or leave it in direct sunlight or hot cars.'
    },
    {
      question: 'When should I contact my healthcare provider?',
      answer: 'Contact your provider if you experience severe or persistent side effects, signs of pancreatitis (severe abdominal pain), allergic reactions, or if you have concerns about your treatment progress. Regular check-ins are important for monitoring your response to treatment.'
    }
  ];

  const handleVideoPlay = (video: any) => {
    setSelectedVideo(video);
    openVideoModal();
  };

  const toggleBookmark = (articleId: number) => {
    // TODO: Implement bookmark functionality with patient preferences
    console.log('Toggle bookmark for article:', articleId);
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container size="lg" p="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2} mb="xs">Educational Resources</Title>
            <Text c="dimmed" size="sm">Learn about your GLP-1 treatment and healthy lifestyle</Text>
          </div>
        </Group>

        {/* Search */}
        <PatientTextInput
          placeholder="Search articles, videos, and FAQs..."
          leftSection={<IconSearch size="1rem" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="md"
        />

        <Tabs value={activeTab} onChange={setActiveTab} variant="pills">
          <Tabs.List grow>
            <Tabs.Tab value="articles" leftSection={<IconBook size="1rem" />}>
              Articles
            </Tabs.Tab>
            <Tabs.Tab value="videos" leftSection={<IconVideo size="1rem" />}>
              Videos
            </Tabs.Tab>
            <Tabs.Tab value="faq" leftSection={<IconQuestionMark size="1rem" />}>
              FAQ
            </Tabs.Tab>
          </Tabs.List>

          {/* Articles Tab */}
          <Tabs.Panel value="articles" pt="md">
            <Grid>
              {filteredArticles.map((article) => (
                <Grid.Col key={article.id} span={{ base: 12, sm: 6, lg: 4 }}>
                  <PatientCard
                    title={article.title}
                    description={article.excerpt}
                    badge={{ text: article.category, variant: 'light' }}
                    variant="interactive"
                    rightSection={
                      <Group gap="xs">
                        <ActionIcon
                          variant={article.bookmarked ? 'filled' : 'light'}
                          color="yellow"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(article.id);
                          }}
                        >
                          <IconBookmark size="0.8rem" />
                        </ActionIcon>
                        <ActionIcon 
                          variant="light" 
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconShare size="0.8rem" />
                        </ActionIcon>
                      </Group>
                    }
                  >
                    <Stack gap="xs" mt="sm">
                      <AspectRatio ratio={16/9}>
                        <Image
                          src={article.image}
                          alt={article.title}
                          fit="cover"
                          radius="sm"
                        />
                      </AspectRatio>

                      <Group justify="space-between" align="center">
                        <Group gap="xs">
                          <IconClock size="0.8rem" />
                          <Text size="xs" c="dimmed">{article.readTime}</Text>
                        </Group>
                        <Group gap="xs">
                          <IconUser size="0.8rem" />
                          <Text size="xs" c="dimmed">{article.author}</Text>
                        </Group>
                      </Group>

                      <PatientButton 
                        patientVariant={article.completed ? 'secondary' : 'primary'}
                        fullWidth 
                        rightSection={<IconChevronRight size="0.8rem" />}
                      >
                        {article.completed ? 'Read Again' : 'Read Article'}
                      </PatientButton>
                    </Stack>
                  </PatientCard>
                </Grid.Col>
              ))}
            </Grid>
          </Tabs.Panel>

          {/* Videos Tab */}
          <Tabs.Panel value="videos" pt="md">
            <Grid>
              {filteredVideos.map((video) => (
                <Grid.Col key={video.id} span={{ base: 12, sm: 6, lg: 4 }}>
                  <PatientCard
                    title={video.title}
                    description={video.description}
                    badge={{ text: video.category, variant: 'light' }}
                    variant="interactive"
                    onClick={() => handleVideoPlay(video)}
                  >
                    <Stack gap="xs" mt="sm">
                      <AspectRatio ratio={16/9}>
                        <div style={{ position: 'relative' }}>
                          <Image
                            src={video.thumbnail}
                            alt={video.title}
                            fit="cover"
                            radius="sm"
                          />
                          <ActionIcon
                            size="xl"
                            radius="xl"
                            color="blue"
                            style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVideoPlay(video);
                            }}
                          >
                            <IconPlayerPlay size="1.5rem" />
                          </ActionIcon>
                          <Badge
                            size="sm"
                            style={{
                              position: 'absolute',
                              bottom: 8,
                              right: 8,
                            }}
                          >
                            {video.duration}
                          </Badge>
                          {video.watched && (
                            <Badge 
                              size="sm" 
                              color="green" 
                              variant="light"
                              style={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                              }}
                            >
                              Watched
                            </Badge>
                          )}
                        </div>
                      </AspectRatio>

                      <Group justify="space-between" align="center">
                        <Group gap="xs">
                          <IconUser size="0.8rem" />
                          <Text size="xs" c="dimmed">{video.instructor}</Text>
                        </Group>
                      </Group>

                      <PatientButton 
                        patientVariant="primary"
                        fullWidth 
                        leftSection={<IconPlayerPlay size="0.8rem" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVideoPlay(video);
                        }}
                      >
                        {video.watched ? 'Watch Again' : 'Watch Video'}
                      </PatientButton>
                    </Stack>
                  </PatientCard>
                </Grid.Col>
              ))}
            </Grid>
          </Tabs.Panel>

          {/* FAQ Tab */}
          <Tabs.Panel value="faq" pt="md">
            <PatientCard title="Frequently Asked Questions" variant="default">
              <Accordion variant="separated" mt="md">
                {faqs.map((faq, index) => (
                  <Accordion.Item key={index} value={`faq-${index}`}>
                    <Accordion.Control>
                      <Text fw={500}>{faq.question}</Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Text size="sm" style={{ lineHeight: 1.6 }}>
                        {faq.answer}
                      </Text>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </PatientCard>
          </Tabs.Panel>
        </Tabs>

        {/* Video Modal */}
        <Modal 
          opened={videoModalOpened} 
          onClose={closeVideoModal} 
          title={selectedVideo?.title}
          size="lg"
          centered
        >
          {selectedVideo && (
            <Stack gap="md">
              <AspectRatio ratio={16/9}>
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px'
                }}>
                  <Stack align="center" gap="md">
                    <IconPlayerPlay size="3rem" color="#868e96" />
                    <Text c="dimmed">Video Player Placeholder</Text>
                    <Text size="sm" c="dimmed">
                      Duration: {selectedVideo.duration}
                    </Text>
                  </Stack>
                </div>
              </AspectRatio>
              
              <div>
                <Group justify="space-between" mb="xs">
                  <Badge variant="light">{selectedVideo.category}</Badge>
                  <Text size="sm" c="dimmed">
                    Instructor: {selectedVideo.instructor}
                  </Text>
                </Group>
                <Text size="sm">{selectedVideo.description}</Text>
              </div>

              <Group justify="space-between">
                <Group gap="xs">
                  <ActionIcon variant="light">
                    <IconBookmark size="1rem" />
                  </ActionIcon>
                  <ActionIcon variant="light">
                    <IconDownload size="1rem" />
                  </ActionIcon>
                  <ActionIcon variant="light">
                    <IconShare size="1rem" />
                  </ActionIcon>
                </Group>
                <PatientButton patientVariant="secondary" onClick={closeVideoModal}>
                  Close
                </PatientButton>
              </Group>
            </Stack>
          )}
        </Modal>
      </Stack>
    </Container>
  );
};

export default PatientResources;