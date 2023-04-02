import { CustomDateTimePicker, CustomSelect, PageMeta } from "@/components";
import useLocalWallet from "@/hooks/useLocalWallet";
import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  List,
  ListItem,
  Text,
  Icon,
  Box,
  Input,
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PublicKey } from "@solana/web3.js";
import { useWorkspace } from "@/components/WorkspaceProvider";
import shortUUID from "short-uuid";
import useFluxus from "@/hooks/useFluxus";
import { Fluxus } from "@/utils/firebase";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/router";

const constantFluxInfo = [
  "Provides a steady stream of funds over a specified period.",
  "Offers flexibility to both payers and payees.",
  "Reduces the need for manual transaction processing.",
  "Ensures consistent cash flow.",
];
const instantDistributionInfo = [
  "Distributes funds instantly to multiple recipients.",
  "Eliminates the need for manual distribution.",
  "Offers real-time transparency on payments.",
  "Increases efficiency and reduces costs",
];

const CreateFlux = () => {
  const [showConstantFluxForm, setShowConstantFluxForm] = useState(false);
  const [showInstantDistributionForm, setShowInstantDistributionForm] =
    useState(false);
  const [isLoading, setLoading] = useState(false);
  const { ownedTokens, isOwnedTokensLoading } = useLocalWallet();
  const { createConstantFlux, instantDistributionFlux } = useFluxus();
  const walletAdapter = useWallet();
  const router = useRouter();

  const schemaConstantFlux = yup.object({
    receiver: yup.string().test({
      name: "isValidPublicKey",
      message: "Invalid public key.",
      test: (value, ctx) => {
        if (!value) return false;
        try {
          PublicKey.isOnCurve(value as string);
          return true;
        } catch (error) {
          return false;
        }
      },
    }),
    token: yup.string().test({
      name: "isValidPublicKey",
      message: "Select a token.",
      test: (value, ctx) => {
        if (!value) return false;
        try {
          PublicKey.isOnCurve(value as string);
          return true;
        } catch (error) {
          return false;
        }
      },
    }),
    amount: yup
      .number()
      .required("Amount is required.")
      .typeError("Must be non-zero.")
      .test({
        name: "verifyBalance",
        message: "Insufficient funds.",
        test: (value, ctx) => {
          const token = ownedTokens.find(
            (token) => token.mint === ctx.parent.token
          );
          if (token?.balance < value) {
            return false;
          }
          return true;
        },
      }),
    days: yup
      .number()
      .required("Days are required.")
      .typeError("Must be non-zero."),
    // startDate: yup
    //   .date()
    //   .required("Start date is required.")
    //   .typeError("State date is invalid."),
  });

  const schemaInstantDistribution = yup.object({
    token: yup.string().test({
      name: "isValidPublicKey",
      message: "Select a token.",
      test: (value, ctx) => {
        if (!value) return false;
        try {
          PublicKey.isOnCurve(value as string);
          return true;
        } catch (error) {
          return false;
        }
      },
    }),
    amount: yup
      .number()
      .required("Amount is required.")
      .typeError("Must be non-zero.")
      .test({
        name: "verifyBalance",
        message: "Insufficient funds.",
        test: (value, ctx) => {
          const token = ownedTokens.find(
            (token) => token.mint === ctx.parent.token
          );
          if (token?.balance < value) {
            return false;
          }
          return true;
        },
      }),
    receivers: yup
      .array()
      .of(
        yup.object().shape({
          address: yup.string().test({
            name: "isValidPublicKey",
            message: "Invalid public key.",
            test: (value, ctx) => {
              if (!value) return false;
              try {
                PublicKey.isOnCurve(value as string);
                return true;
              } catch (error) {
                return false;
              }
            },
          }),
          share: yup
            .number()
            .min(1, "Must be at lest 1.")
            .max(100, "Must be less than 100.")
            .typeError("Invalid share.")
            .required("Share is required."),
        })
      )
      .min(1, "At least one receiver is required.")
      .test({
        name: "isValidShare",
        message: "Invalid share.",
        test: (value, ctx) => {
          if (value) {
            // @ts-ignore
            const shares = value?.map((c) => c.share);
            // @ts-ignore
            return (
              shares.length > 0 &&
              // @ts-ignore
              shares?.reduce((acc, item) => acc + item) === 100
            );
          }
          return false;
        },
      }),
  });

  const {
    register: constantFluxRegister,
    handleSubmit: constantFluxHandleSubmit,
    formState: { errors: constantFluxErrors },
    control: constantFluxControl,
    reset: constantFlusReset,
  } = useForm({
    resolver: yupResolver(schemaConstantFlux),
    defaultValues: {
      receiver: "",
      token: "",
      amount: undefined,
      // startDate: undefined,
      days: undefined,
    },
  });

  const onSubmitConstantFlux = async (data: any) => {
    try {
      if (!walletAdapter.connected || !walletAdapter.publicKey) return;
      setLoading(true);
      const fluxId = shortUUID.generate().slice(0, 10);
      const decimals = ownedTokens.find(
        (token) => token.mint === data.token
      ).decimals;
      // console.log(data, fluxId, decimals);
      const result = await createConstantFlux(
        new PublicKey(data.token),
        new PublicKey(data.receiver),
        fluxId,
        data.amount,
        decimals,
        data.days
      );
      const fluxus = new Fluxus(walletAdapter.publicKey.toBase58());
      await fluxus.addOrUpdateConstantFlux(
        result?.account.constantFlux as string,
        { account: result?.account, fluxId }
      );
      router.replace("/");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const {
    register: instantDistributionRegister,
    handleSubmit: instantDistributionHandleSubmit,
    formState: { errors: instantDistributionErrors },
    control: instantDistributionControl,
    reset: instantDistributionReset,
  } = useForm<{
    token: string;
    amount: undefined;
    receivers: {
      address: string;
      share: number;
    }[];
  }>({
    resolver: yupResolver(schemaInstantDistribution),
    defaultValues: {
      token: "",
      receivers: [{ address: "", share: undefined }],
    },
  });

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control: instantDistributionControl,
      name: "receivers",
    }
  );

  const onSubmitInstantDistribution = async (data: any) => {
    try {
      if (!walletAdapter.connected || !walletAdapter.publicKey) return;
      setLoading(true);
      console.log(data);
      const mint = new PublicKey(data.token);
      const decimals = ownedTokens.find(
        (token) => token.mint === data.token
      ).decimals;
      const receivers = data.receivers;
      const receiversPublicKeys = receivers.map(
        (receiver: any) => new PublicKey(receiver.address)
      );
      const receiversShares = receivers.map((receiver: any) => receiver.share);
      await instantDistributionFlux(
        mint,
        receiversPublicKeys,
        data.amount,
        decimals,
        receiversShares
      );
      instantDistributionReset();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.xl" h="full" mt="28">
      <PageMeta title="Create Flux" />
      {!showConstantFluxForm && !showInstantDistributionForm && (
        <Flex w="full" alignItems="center" flexDir="column">
          <Flex
            w={["full", "470px", "470px", "470px", "470px"]}
            h={["md", "xs", "xs", "xs", "xs"]}
            bg="secondary.500"
            justifyContent={"space-between"}
            alignItems="center"
            borderRadius={"12"}
            flexDir="column"
            p="4"
          >
            <Flex flexDir="column" alignItems={"center"}>
              <Text color="primary.900">Constant Flux</Text>
              <List spacing={3} mt="6" px="6">
                {constantFluxInfo.map((info, i) => (
                  <ListItem key={i}>
                    <Text fontSize="15" color="gray.400" textAlign="center">
                      {info}
                    </Text>
                  </ListItem>
                ))}
              </List>
            </Flex>
            <Button
              variant={"primary"}
              mt="2"
              w="full"
              onClick={() => setShowConstantFluxForm(true)}
            >
              Create
            </Button>
          </Flex>
          <Flex
            mt="10"
            w={["full", "470px", "470px", "470px", "470px"]}
            h={["md", "xs", "xs", "xs", "xs"]}
            bg="secondary.500"
            justifyContent={"space-between"}
            alignItems="center"
            borderRadius={"12"}
            flexDir="column"
            p="4"
          >
            <Flex flexDir="column" alignItems={"center"}>
              <Text color="primary.900">Instant Distribution Flux</Text>
              <List spacing={3} mt="6" px="6">
                {instantDistributionInfo.map((info, i) => (
                  <ListItem key={i}>
                    <Text fontSize="15" color="gray.400" textAlign="center">
                      {info}
                    </Text>
                  </ListItem>
                ))}
              </List>
            </Flex>
            <Button
              variant={"primary"}
              mt="2"
              w="full"
              onClick={() => setShowInstantDistributionForm(true)}
            >
              Create
            </Button>
          </Flex>
        </Flex>
      )}
      {showConstantFluxForm && (
        <Flex flexDir="column" w="full" alignItems={"center"}>
          <Flex
            w="full"
            alignItems={"center"}
            justifyContent="center"
            maxW={["full", "full", "md", "md", "md"]}
          >
            <Flex flex="1">
              <Icon
                as={ArrowBackIcon}
                w="6"
                h="6"
                color="primary.900"
                cursor="pointer"
                onClick={() => {
                  setShowConstantFluxForm(false);
                  constantFlusReset();
                }}
              />
            </Flex>
            <Text fontSize="24" textAlign="center" w="full" color="white">
              Constant Flex
            </Text>
          </Flex>
          <Box mt="6" w={["full", "full", "md", "md", "md"]}>
            <form onSubmit={constantFluxHandleSubmit(onSubmitConstantFlux)}>
              <FormControl isInvalid={!!constantFluxErrors.receiver}>
                <FormLabel fontSize={"14"} color="gray.400">
                  Recipient Wallet Address
                </FormLabel>
                <Input
                  placeholder="Receiver"
                  w={["full", "full", "md", "md", "md"]}
                  id="receiver"
                  autoComplete={"off"}
                  color={"primary.900"}
                  _placeholder={{
                    color: "gray.500",
                  }}
                  {...constantFluxRegister("receiver")}
                />
                <FormErrorMessage>
                  {constantFluxErrors!.receiver
                    ? constantFluxErrors!.receiver!.message
                    : ""}
                </FormErrorMessage>
              </FormControl>

              <CustomSelect
                label="Streamable Token"
                // @ts-ignore
                control={constantFluxControl}
                id="token"
                placeholder="Select token"
                {...constantFluxRegister("token")}
                options={ownedTokens?.map((mintToken: any) => {
                  return {
                    value: mintToken.mint,
                    label: `${mintToken.name} (${mintToken.balance})`,
                    icon: mintToken.logoURI,
                  };
                })}
                selectProps={{
                  isSearchable: false,
                  isLoading: isOwnedTokensLoading,
                }}
                error={constantFluxErrors?.token?.message as string}
              />
              <FormControl isInvalid={!!constantFluxErrors.amount} mt="4">
                <FormLabel fontSize={"14"} color="gray.400">
                  Amount
                </FormLabel>
                <Input
                  placeholder="0.00"
                  w={["full", "full", "md", "md", "md"]}
                  id="amount"
                  autoComplete={"off"}
                  color={"primary.900"}
                  _placeholder={{
                    color: "gray.500",
                  }}
                  type="number"
                  step={"any"}
                  {...constantFluxRegister("amount")}
                />
                <FormErrorMessage>
                  {constantFluxErrors!.amount
                    ? constantFluxErrors!.amount!.message
                    : ""}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!constantFluxErrors.days} mt="4">
                <FormLabel fontSize={"14"} color="gray.400">
                  Number of Days
                </FormLabel>
                <Input
                  placeholder="0"
                  w={["full", "full", "md", "md", "md"]}
                  id="days"
                  autoComplete={"off"}
                  color={"primary.900"}
                  _placeholder={{
                    color: "gray.500",
                  }}
                  type="number"
                  {...constantFluxRegister("days")}
                />
                <FormErrorMessage>
                  {constantFluxErrors!.days
                    ? constantFluxErrors!.days!.message
                    : ""}
                </FormErrorMessage>
              </FormControl>
              {/* <CustomDateTimePicker
                // @ts-ignore
                control={constantFluxControl}
                id="startDate"
                label="Start Date"
                error={constantFluxErrors!.startDate?.message as string}
                {...constantFluxRegister("startDate")}
                dateTimePickerProps={{ minDate: new Date() }}
              /> */}
              <Button
                isLoading={isLoading}
                loadingText="Creating.."
                variant={"primary"}
                mt="4"
                w="full"
                type="submit"
              >
                Create
              </Button>
            </form>
          </Box>
        </Flex>
      )}
      {showInstantDistributionForm && (
        <Flex flexDir="column" w="full" alignItems={"center"}>
          <Flex
            w="full"
            alignItems={"center"}
            justifyContent="center"
            maxW={["full", "full", "md", "md", "md"]}
          >
            <Flex flex="1">
              <Icon
                as={ArrowBackIcon}
                w="6"
                h="6"
                color="primary.900"
                cursor="pointer"
                onClick={() => {
                  setShowInstantDistributionForm(false);
                  instantDistributionReset();
                }}
              />
            </Flex>
            <Text fontSize="24" textAlign="center" w="full" color="white">
              Instant Distribution
            </Text>
          </Flex>
          <Box mt="6" w={["full", "full", "md", "md", "md"]}>
            <form
              onSubmit={instantDistributionHandleSubmit(
                onSubmitInstantDistribution
              )}
            >
              <CustomSelect
                label="Streamable Token"
                // @ts-ignore
                control={instantDistributionControl}
                id="token"
                placeholder="Select token"
                {...instantDistributionRegister("token")}
                options={ownedTokens?.map((mintToken: any) => {
                  return {
                    value: mintToken.mint,
                    label: `${mintToken.name} (${mintToken.balance})`,
                    icon: mintToken.logoURI,
                  };
                })}
                selectProps={{
                  isSearchable: false,
                  isLoading: isOwnedTokensLoading,
                }}
                error={instantDistributionErrors?.token?.message as string}
              />
              <FormControl
                isInvalid={!!instantDistributionErrors.amount}
                mt="4"
              >
                <FormLabel fontSize={"14"} color="gray.400">
                  Amount
                </FormLabel>
                <Input
                  placeholder="0.00"
                  w={["full", "full", "md", "md", "md"]}
                  id="amount"
                  autoComplete={"off"}
                  color={"primary.900"}
                  _placeholder={{
                    color: "gray.500",
                  }}
                  type="number"
                  step={"any"}
                  {...instantDistributionRegister("amount")}
                />
                <FormErrorMessage>
                  {instantDistributionErrors!.amount
                    ? instantDistributionErrors!.amount!.message
                    : ""}
                </FormErrorMessage>
              </FormControl>
              <Flex alignItems={"center"} justifyContent="space-between" mt="4">
                <FormLabel fontSize={"14"} color="gray.400" mb="0">
                  Receivers
                </FormLabel>
                <Button
                  size={"xs"}
                  variant="link"
                  // @ts-ignore
                  onClick={() => append({ address: "", share: null })}
                >
                  Add Receiver
                </Button>
              </Flex>
              {fields.map((field, index) => (
                <Flex
                  key={field.id}
                  w="full"
                  alignItems="center"
                  flexDir={"column"}
                  border={
                    instantDistributionErrors?.receivers
                      ? "1px solid red"
                      : "1px solid gray"
                  }
                  padding="2"
                  borderRadius={"4"}
                  my="2"
                >
                  <FormControl
                    isInvalid={
                      instantDistributionErrors!.receivers &&
                      !!instantDistributionErrors!.receivers![index]?.address
                        ?.message
                    }
                  >
                    <FormLabel fontSize={"12"} color="gray.400">
                      Recipient Wallet Address
                    </FormLabel>
                    <Input
                      placeholder="Receiver"
                      w={"full"}
                      id={`receivers.${index}.address`}
                      autoComplete={"off"}
                      color={"primary.900"}
                      _placeholder={{
                        color: "gray.500",
                      }}
                      {...instantDistributionRegister(
                        `receivers.${index}.address`
                      )}
                    />
                    <FormErrorMessage>
                      {instantDistributionErrors!.receivers
                        ? instantDistributionErrors!.receivers![index]?.address
                            ?.message
                        : ""}
                    </FormErrorMessage>
                  </FormControl>
                  <FormControl
                    isInvalid={
                      instantDistributionErrors!.receivers &&
                      !!instantDistributionErrors!.receivers![index]?.share
                        ?.message
                    }
                    mt="2"
                  >
                    <FormLabel fontSize={"12"} color="gray.400">
                      Recipient Share
                    </FormLabel>
                    <Input
                      placeholder="Share"
                      w={"full"}
                      id={`receivers.${index}.share`}
                      autoComplete={"off"}
                      color={"primary.900"}
                      _placeholder={{
                        color: "gray.500",
                      }}
                      {...instantDistributionRegister(
                        `receivers.${index}.share`
                      )}
                    />
                    <FormErrorMessage>
                      {instantDistributionErrors!.receivers
                        ? instantDistributionErrors!.receivers![index]?.share
                            ?.message
                        : ""}
                    </FormErrorMessage>
                  </FormControl>
                  <Button
                    mt="2"
                    alignSelf={"flex-end"}
                    size={"xs"}
                    variant="link"
                    onClick={() => remove(index)}
                  >
                    Remove Receiver
                  </Button>
                </Flex>
              ))}
              {instantDistributionErrors?.receivers && (
                <Text fontSize="12" color="red">
                  {instantDistributionErrors?.receivers.message}
                </Text>
              )}
              <Button
                isLoading={isLoading}
                loadingText="Distributing.."
                variant={"primary"}
                mt="4"
                w="full"
                type="submit"
              >
                Distribute
              </Button>
            </form>
          </Box>
        </Flex>
      )}
    </Container>
  );
};

export default CreateFlux;
