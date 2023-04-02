import { Empty } from "@/assets/SVGs";
import { ConstantFluxCard, PageMeta } from "@/components";
import useFluxus from "@/hooks/useFluxus";
import useMetaplex from "@/hooks/useMetaplex";
import { truncateAddress, getUrls, NETWORK } from "@/utils";
import { SpinnerIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  Icon,
  Spinner,
  keyframes,
} from "@chakra-ui/react";
import { FiRefreshCcw } from "react-icons/fi";

const spinAnimationKeyframes = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;
const animation = `${spinAnimationKeyframes} 2s linear infinite`;

const KeyValue = ({
  title,
  valueComponent,
}: {
  title: string;
  valueComponent: React.ReactElement;
}) => {
  return (
    <Flex justifyContent={"space-between"} w="full" my="2">
      <Text color="gray.300" fontSize={["14", "14", "16", "16", "16"]}>
        {title}
      </Text>
      {valueComponent}
    </Flex>
  );
};

export default function Home() {
  const {
    asCreatorConstantFluxAccounts,
    asReceiverConstantFluxAccounts,
    asCreatorConstantFluxAccountsLoading,
    asReceiverConstantFluxAccountsLoading,
    getAsCreatorConstantFluxAccounts,
    getAsReceiverConstantFluxAccounts,
  } = useFluxus(true);
  return (
    <Container maxW="container.xl" h="full" mt="28">
      <PageMeta />
      <Box>
        <Flex alignItems={"center"} w="full" justifyContent={"space-between"}>
          <Text fontSize={"20"} color="primary.500">
            Created Constant Flux
          </Text>
          <Button
            size="xs"
            py="0.5"
            px="2"
            bg="background.900"
            color="primary.900"
            borderRadius={"4"}
            onClick={getAsCreatorConstantFluxAccounts}
            loadingText="Refreshing..."
            isLoading={asCreatorConstantFluxAccountsLoading}
            _hover={{
              backgroundColor: "background.900",
              color: "primary.900",
            }}
          >
            Refresh
          </Button>
          {/* <Icon
            as={FiRefreshCcw}
            w="4"
            h="4"
            cursor="pointer"
            color="primary.900"
            animation={asCreatorConstantFluxAccountsLoading ? animation : ""}
            onClick={getAsCreatorConstantFluxAccounts}
          /> */}
        </Flex>
        <Grid
          templateColumns={[
            "repeat(1, 1fr)",
            "repeat(1, 1fr)",
            "repeat(1, 1fr)",
            "repeat(2, 1fr)",
            "repeat(2, 1fr)",
          ]}
          gap={1}
        >
          {asCreatorConstantFluxAccounts?.length > 0 ? (
            asCreatorConstantFluxAccounts?.map(
              (asCreatorConstantFluxAccount: any, index: any) => (
                <GridItem key={index}>
                  <ConstantFluxCard account={asCreatorConstantFluxAccount} />
                </GridItem>
              )
            )
          ) : (
            <GridItem colSpan={2}>
              <Flex
                mt="4"
                justifyContent={"center"}
                alignItems="center"
                flexDir="column"
                opacity="0.7"
                userSelect={"none"}
                p="10"
                border="1px solid gray"
                borderRadius={"12"}
              >
                <Empty width={50} height={50} />
                <Text color="gray.600">No flux found</Text>
              </Flex>
            </GridItem>
          )}
        </Grid>
      </Box>
      <Box my="4" w="full">
        <Flex alignItems={"center"} w="full" justifyContent={"space-between"}>
          <Text fontSize={"20"} color="primary.500">
            Receiving Constant Flux
          </Text>
          <Button
            size="xs"
            py="0.5"
            px="2"
            bg="background.900"
            color="primary.900"
            borderRadius={"4"}
            onClick={getAsReceiverConstantFluxAccounts}
            loadingText="Refreshing..."
            isLoading={asReceiverConstantFluxAccountsLoading}
            _hover={{
              backgroundColor: "background.900",
              color: "primary.900",
            }}
          >
            Refresh
          </Button>
          {/* <Icon
            as={FiRefreshCcw}
            w="4"
            h="4"
            cursor="pointer"
            color="primary.900"
            animation={asReceiverConstantFluxAccountsLoading ? animation : ""}
            onClick={getAsReceiverConstantFluxAccounts}
          /> */}
        </Flex>
        <Grid
          templateColumns={[
            "repeat(1, 1fr)",
            "repeat(1, 1fr)",
            "repeat(1, 1fr)",
            "repeat(2, 1fr)",
            "repeat(2, 1fr)",
          ]}
          gap={1}
        >
          {asReceiverConstantFluxAccounts?.length > 0 ? (
            asReceiverConstantFluxAccounts?.map(
              (asReceiverConstantFluxAccount: any, index: any) => (
                <GridItem key={index}>
                  <ConstantFluxCard
                    isCreated={false}
                    account={asReceiverConstantFluxAccount}
                  />
                </GridItem>
              )
            )
          ) : (
            <GridItem colSpan={2}>
              <Flex
                mt="4"
                justifyContent={"center"}
                alignItems="center"
                flexDir="column"
                opacity="0.7"
                userSelect={"none"}
                p="10"
                border="1px solid gray"
                borderRadius={"12"}
              >
                <Empty width={50} height={50} />
                <Text color="gray.600">No flux found</Text>
              </Flex>
            </GridItem>
          )}
        </Grid>
      </Box>
    </Container>
  );
}
