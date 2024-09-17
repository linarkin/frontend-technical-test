import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  Textarea,
  VStack,
  Text,
} from '@chakra-ui/react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { MemeEditor } from '../../components/meme-editor';
import { useMemo, useState, useEffect } from 'react';
import { Plus, Trash } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useAuthToken } from '../../contexts/authentication';
import { createMeme } from '../../api';

export const Route = createFileRoute('/_authentication/create')({
  component: CreateMemePage,
});

type Picture = {
  url: string;
  file: File;
};

function CreateMemePage() {
  const token = useAuthToken();
  const navigate = useNavigate();
  const [picture, setPicture] = useState<Picture | null>(null);
  const [texts, setTexts] = useState<MemePictureType['texts']>([]);
  const [description, setDescription] = useState<string>('');

  const handleDrop = (file: File) => {
    setPicture({
      url: URL.createObjectURL(file),
      file,
    });
  };

  const handleAddCaptionButtonClick = () => {
    setTexts([
      ...texts,
      {
        content: `New caption ${texts.length + 1}`,
        x: Math.random() * 400,
        y: Math.random() * 225,
      },
    ]);
  };

  const handleDeleteCaptionButtonClick = (index: number) => {
    setTexts(texts.filter((_, i) => i !== index));
  };

  const handleCaptionChange = (index: number, value: string) => {
    setTexts(
      texts.map((text, i) => (i === index ? { ...text, content: value } : text))
    );
  };

  const memePicture = useMemo(() => {
    if (!picture) return undefined;

    return {
      id: '',
      createdAt: '',
      authorId: '',
      pictureUrl: picture.url,
      texts,
      description,
    };
  }, [picture, texts]);

  const { mutate } = useMutation({
    mutationFn: async (data: {
      token: string;
      description: string;
      texts: { content: string; x: number; y: number }[];
      picture: File;
    }) => {
      picture && (await createMeme(token, description, texts, picture.file));
    },
    onSuccess: () => {
      navigate({ to: '/' });
    },
  });

  const onSubmit = async () => {
    if (picture) {
      await mutate({
        token: token,
        description: description,
        texts: texts,
        picture: picture.file,
      });
    }
  };

  useEffect(() => {
    if (memePicture && memePicture.texts.length === texts.length) {
      setTexts(
        texts.map((text, index) => ({
          ...text,
          x: memePicture.texts[index].x,
          y: memePicture.texts[index].y,
        }))
      );
    }
  }, [picture?.url]);

  return (
    <Flex width="full" height="full">
      <Box flexGrow={1} height="full" p={4} overflowY="auto">
        <VStack spacing={5} align="stretch">
          <Box>
            <Heading as="h2" size="md" mb={2}>
              Upload your picture
            </Heading>
            <MemeEditor onDrop={handleDrop} memePicture={memePicture} />
          </Box>
          <Box>
            <Heading as="h2" size="md" mb={2}>
              Describe your meme
              <Text as="span" color="tomato">
                *
              </Text>
            </Heading>
            <Textarea
              placeholder="Type your description here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>
        </VStack>
      </Box>
      <Flex
        flexDir="column"
        width="30%"
        minW="250px"
        height="full"
        boxShadow="lg"
      >
        <Heading as="h2" size="md" mb={2} p={4}>
          Add your captions
        </Heading>
        <Box p={4} flexGrow={1} height={0} overflowY="auto">
          <VStack>
            {texts.map((text, index) => (
              <Flex width="full" key={index}>
                <Input
                  value={text.content}
                  mr={1}
                  onChange={(e) => handleCaptionChange(index, e.target.value)}
                />
                <IconButton
                  onClick={() => handleDeleteCaptionButtonClick(index)}
                  aria-label="Delete caption"
                  icon={<Trash />}
                />
              </Flex>
            ))}
            <Button
              colorScheme="cyan"
              leftIcon={<Plus />}
              variant="ghost"
              size="sm"
              width="full"
              onClick={handleAddCaptionButtonClick}
              isDisabled={!memePicture}
            >
              Add a caption
            </Button>
          </VStack>
        </Box>
        <HStack p={4}>
          <Button
            as={Link}
            to="/"
            colorScheme="cyan"
            variant="outline"
            size="sm"
            width="full"
          >
            Cancel
          </Button>
          <Button
            colorScheme="cyan"
            size="sm"
            width="full"
            color="white"
            isDisabled={!memePicture || !description}
            onClick={onSubmit}
          >
            Submit
          </Button>
        </HStack>
      </Flex>
    </Flex>
  );
}
