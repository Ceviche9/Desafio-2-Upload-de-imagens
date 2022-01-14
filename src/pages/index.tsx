import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

type ImageResponseData = {
  title: string;
  description: string;
  url: string;
  ts: number;
  id: string;
};

type GetImagesResponse = {
  data: ImageResponseData[];
  after: string | null;
};

export default function Home(): JSX.Element {
  /*
    1. Uma função que recebe como parâmetro um objeto que contêm a propriedade `pageParam`
    (caso o parâmetro não exista, utilize como `default` o valor `null`). Esse parâmetro
    é utilizado no momento da requisição para chamarmos uma próxima página.
    Já no corpo da função, você deve realizar uma requisição GET para a rota `/api/images`
    da API do Next.js informando como um `query param` de nome `after` o valor do `pageParam`
    e retornar os dados recebidos.
  */
  const getImagesWithPagination = async ({
    pageParam = null,
  }): Promise<GetImagesResponse> => {
    const response = await api.get('/api/images', {
      params: {
        after: pageParam,
      },
    });

    return response.data;
  };

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery('images', getImagesWithPagination, {
    getNextPageParam: lastPage => (lastPage.after ? lastPage.after : null),
  });

  const formattedData = useMemo(() => {
    if (!data) {
      return [];
    }

    const newFormattedData = data.pages.map(page => page.data);

    return newFormattedData.flat();
  }, [data]);

  // TODO RENDER LOADING SCREEN
  if (isLoading) {
    return <Loading />;
  }

  // TODO RENDER ERROR SCREEN
  if (isError) {
    return <Error />;
  }

  return (
    <>
      <Header />

      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />
        {
          /* TODO RENDER LOAD MORE BUTTON IF DATA HAS NEXT PAGE */
          hasNextPage && (
            <Button onClick={() => fetchNextPage}>
              {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
            </Button>
          )
        }
      </Box>
    </>
  );
}
