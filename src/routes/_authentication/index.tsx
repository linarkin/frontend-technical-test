import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Icon,
  StackDivider,
  Text,
  VStack,
  Avatar,
  Tooltip,
  IconButton,
} from '@chakra-ui/react';
import { CaretRight, CaretLeft } from '@phosphor-icons/react';
import { format } from 'timeago.js';
import { getMemes, getUserById } from '../../api';
import { useAuthToken } from '../../contexts/authentication';
import { Loader } from '../../components/loader';
import { MemePicture } from '../../components/meme-picture';
import { MemeCommentsSection } from '../../components/comments/comments-section';

export const MemeFeedPage: React.FC = () => {
  const token = useAuthToken();
  const [authors, setAuthors] = useState<{ [key: string]: MemeAuthor }>({});
  const [pagesQuantity, setPagesQuantity] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const pendingFetches = useRef<Set<string>>(new Set());

  const {
    isLoading,
    data: memes,
    refetch,
  } = useQuery({
    queryKey: ['memes'],
    queryFn: () => getMemes(token, currentPage),
  });

  // Fetch author if not already cached
  const fetchAuthor = async (authorId: string) => {
    if (!authors[authorId] && !pendingFetches.current.has(authorId)) {
      pendingFetches.current.add(authorId);
      const authorData = await getUserById(token, authorId);
      setAuthors((prevAuthors) => ({
        ...prevAuthors,
        [authorId]: authorData,
      }));
      pendingFetches.current.delete(authorId);
    }
  };

  useEffect(() => {
    if (memes?.results) {
      // Pre-fetch authors for all memes that don't have cached data
      memes.results.forEach((meme: MemePictureType) => {
        if (!authors[meme.authorId]) {
          fetchAuthor(meme.authorId);
        }
      });
      setPagesQuantity(memes.total);
    }
  }, [memes]);

  const previousPage = async () => {
    if (currentPage > 1) {
      await setCurrentPage(currentPage - 1);
      refetch();
    }
  };
  const nextPage = async () => {
    if (currentPage < pagesQuantity) {
      await setCurrentPage(currentPage + 1);
      refetch();
    }
  };

  if (isLoading) {
    return <Loader data-testid="meme-feed-loader" />;
  }

  return (
    <Flex width="full" height="full" justifyContent="center" overflowY="auto">
      <VStack
        p={4}
        width="full"
        maxWidth={800}
        divider={<StackDivider border="gray.200" />}
      >
        {memes?.results.map((meme: MemePictureType) => {
          const author = authors[meme.authorId];

          return (
            <VStack key={meme.id} p={4} width="full" align="stretch">
              <Flex justifyContent="space-between" alignItems="center">
                <Flex>
                  <Avatar
                    borderWidth="1px"
                    borderColor="gray.300"
                    size="xs"
                    name={author?.username || 'Loading...'}
                    src={author?.pictureUrl}
                  />
                  <Text ml={2} data-testid={`meme-author-${meme.id}`}>
                    {author?.username || 'Loading...'}
                  </Text>
                </Flex>
                <Text fontStyle="italic" color="gray.500" fontSize="small">
                  {format(meme.createdAt)}
                </Text>
              </Flex>

              <MemePicture
                {...meme}
                dataTestId={`meme-picture-${meme.id}`}
                readOnly
              />

              <Box>
                <Text fontWeight="bold" fontSize="medium" mb={2}>
                  Description:
                </Text>
                <Box
                  p={2}
                  borderRadius={8}
                  border="1px solid"
                  borderColor="gray.100"
                >
                  <Text
                    color="gray.500"
                    whiteSpace="pre-line"
                    data-testid={`meme-description-${meme.id}`}
                  >
                    {meme.description}
                  </Text>
                </Box>
              </Box>

              <MemeCommentsSection memeId={meme.id} token={token} />
            </VStack>
          );
        })}
        <Flex mt={6} pb={6} justifyContent="center" alignItems="center">
          <Tooltip label="Previous Page">
            <IconButton
              onClick={previousPage}
              aria-label={'Previous Page'}
              icon={<Icon as={CaretLeft} />}
              isDisabled={currentPage === 1}
            />
          </Tooltip>
          <Box>
            <Text fontSize="medium" mx={4}>
              Page {currentPage} from {pagesQuantity}
            </Text>
          </Box>
          <Tooltip label="Next Page">
            <IconButton
              onClick={nextPage}
              icon={<Icon as={CaretRight} />}
              aria-label={'Next Page'}
              isDisabled={currentPage === pagesQuantity}
            />
          </Tooltip>
        </Flex>
      </VStack>
    </Flex>
  );
};

export const Route = createFileRoute('/_authentication/')({
  component: MemeFeedPage,
});
