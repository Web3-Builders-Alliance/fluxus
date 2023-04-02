import useMetaplex from "@/hooks/useMetaplex";
import { getUrls, NETWORK, truncateAddress } from "@/utils";
import { InfoIcon } from "@chakra-ui/icons";
import { Button, Flex, Image, Text, Icon, Tooltip } from "@chakra-ui/react";
import { TokenListProvider } from "@solana/spl-token-registry";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import React, { useCallback, useEffect, useState } from "react";
import { FiRefreshCcw } from "react-icons/fi";
import * as anchor from "@project-serum/anchor";
import useFluxus from "@/hooks/useFluxus";
import { Fluxus } from "@/utils/firebase";

const KeyValue = ({
  title,
  valueComponent,
  infoLabel,
}: {
  title: string;
  valueComponent: React.ReactElement;
  infoLabel?: string;
}) => {
  return (
    <Flex justifyContent={"space-between"} w="full" my="2">
      <Flex alignItems={"center"}>
        <Text color="gray.300" fontSize={["14", "14", "16", "16", "16"]} mr="2">
          {title}
        </Text>
        {infoLabel && (
          <Tooltip
            label={infoLabel}
            hasArrow
            bg="primary.900"
            color="primary.100"
            placement="bottom"
          >
            <Icon as={InfoIcon} w="3" h="3" color="primary.900" />
          </Tooltip>
        )}
      </Flex>
      {valueComponent}
    </Flex>
  );
};

const ConstantFluxCard = ({
  account,
  isCreated = true,
}: {
  account: any;
  isCreated?: boolean;
}) => {
  const startTime = account?.account?.startUnixTimestamp * 1000;
  const endTime = account?.account?.endUnixTimestamp * 1000;
  const lastUpdatedTime = account?.account?.lastUpdatedUnixTimestamp * 1000;
  const totalAmount = new anchor.BN(account?.account?.totalAmount);
  const streamableAmount = new anchor.BN(account?.account?.streamableAmount);
  const currentTime = Date.now();
  const currentStreamablePercent = Math.min(
    ((currentTime - lastUpdatedTime) / (endTime - lastUpdatedTime)) * 100,
    100
  );
  // const currentStreamableAmount = new anchor.BN(
  //   streamableAmount.mul(new anchor.BN(currentStreamablePercent))
  //   // .div(new anchor.BN(100))
  // ).toNumber();
  const currentStreamableAmount =
    streamableAmount.toNumber() * (currentStreamablePercent / 100);

  const [mintMetadata, setMintMetadata] = useState<any>({});
  const [cancelLoading, setCancelLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);

  const { metaplex } = useMetaplex();
  const { cancelConstantFlux, claimConstantFlux } = useFluxus();
  const walletAdapter = useWallet();

  const getMintMetadata = useCallback(async () => {
    try {
      let tokenMap = new Map();
      const tokens = await new TokenListProvider().resolve();
      const tokenList = tokens.filterByClusterSlug("devnet").getList();
      tokenMap = tokenList.reduce((map, item) => {
        map.set(item.address, item);
        return map;
      }, new Map());

      let legacyMint = tokenMap.get(account?.account?.mint);

      if (legacyMint) {
        return setMintMetadata({
          address: legacyMint.address,
          symbol: legacyMint.symbol,
          name: legacyMint.name,
          decimals: legacyMint.decimals,
          logoURI: legacyMint.logoURI,
        });
      }

      const mxFetched = await metaplex
        .nfts()
        .findByMint({ mintAddress: new PublicKey(account?.account?.mint) })
        .catch((e) => {});

      if (mxFetched) {
        if (mxFetched!.mint.currency.decimals !== 0) {
          return setMintMetadata({
            address: mxFetched!.mint.address.toBase58(),
            symbol: mxFetched!.mint.currency.symbol,
            name: mxFetched!.name,
            decimals: mxFetched!.mint.currency.decimals,
            logoURI: mxFetched!.json?.image,
          });
        }
      }
      return setMintMetadata({});
    } catch (error) {
      console.log(error);
    }
  }, [account?.account?.mint, metaplex]);

  useEffect(() => {
    getMintMetadata()
      .then(() => {})
      .catch((error) => console.log(error));
  }, [getMintMetadata]);

  const onClickCancelConstantFlux = async () => {
    try {
      if (!walletAdapter.connected || !walletAdapter.publicKey) return;
      const mint = account?.account?.mint;
      const receiver = account?.account?.recipient;
      if (!mint || !receiver) return;
      setCancelLoading(true);
      const fluxus = new Fluxus(walletAdapter.publicKey?.toBase58());
      const res = await fluxus.getConstantFlux(account?.publicKey);
      const fluxId = res.data()?.fluxId;
      await cancelConstantFlux(mint, receiver, fluxId);
    } catch (error) {
      console.log(error);
    } finally {
      setCancelLoading(false);
    }
  };

  const onClickClaimConstantFlux = async () => {
    try {
      if (!walletAdapter.connected || !walletAdapter.publicKey) return;
      const mint = account?.account?.mint;
      const authority = account?.account?.authority;
      const receiverTokenAccount = account?.account?.recipientTokenAccount;
      if (!mint || !authority) return;
      setClaimLoading(true);
      const fluxus = new Fluxus(authority);
      const res = await fluxus.getConstantFlux(account?.publicKey?.toBase58());
      const fluxId = res.data()?.fluxId;
      await claimConstantFlux(mint, authority, fluxId, receiverTokenAccount);
    } catch (error) {
      console.log(error);
    } finally {
      setClaimLoading(false);
    }
  };

  return (
    <Flex
      m="2"
      p="4"
      h="fit-content"
      flexDir={"column"}
      bg="secondary.500"
      borderRadius={"12"}
    >
      <KeyValue
        title="Start datetime"
        valueComponent={
          <Flex>
            <Text
              color="primary.900"
              mr="2"
              fontSize={["14", "14", "16", "16", "16"]}
            >
              {new Date(
                account?.account?.startUnixTimestamp.toNumber() * 1000
              ).toLocaleDateString()}
            </Text>
            <Text color="primary.900" fontSize={["14", "14", "16", "16", "16"]}>
              {new Date(
                account?.account?.startUnixTimestamp.toNumber() * 1000
              ).toLocaleTimeString()}
            </Text>
          </Flex>
        }
      />
      <KeyValue
        title="End datetime"
        valueComponent={
          <Flex>
            <Text
              color="primary.900"
              mr="2"
              fontSize={["14", "14", "16", "16", "16"]}
            >
              {new Date(
                account?.account?.endUnixTimestamp.toNumber() * 1000
              ).toLocaleDateString()}
            </Text>
            <Text color="primary.900" fontSize={["14", "14", "16", "16", "16"]}>
              {new Date(
                account?.account?.endUnixTimestamp.toNumber() * 1000
              ).toLocaleTimeString()}
            </Text>
          </Flex>
        }
      />
      <KeyValue
        title={"Total streamable amount"}
        valueComponent={
          <Text color="primary.900" fontSize={["14", "14", "16", "16", "16"]}>
            {mintMetadata?.decimals
              ? account?.account?.totalAmount?.toNumber() /
                10 ** mintMetadata?.decimals
              : account?.account?.totalAmount?.toNumber()}
            {` ${mintMetadata?.symbol ? mintMetadata?.symbol : "UKN"}`}
          </Text>
        }
        infoLabel={`(in ${
          mintMetadata?.symbol ? mintMetadata?.symbol : "UKN"
        })`}
      />
      <KeyValue
        title="Current streamable percent"
        valueComponent={
          <Text color="primary.900" fontSize={["14", "14", "16", "16", "16"]}>
            {`~ `}
            {currentStreamablePercent.toPrecision(4)}
            {` %`}
          </Text>
        }
        infoLabel={"(in %)"}
      />
      <KeyValue
        title={"Current streamable amount"}
        valueComponent={
          <Text color="primary.900" fontSize={["14", "14", "16", "16", "16"]}>
            {`~ `}
            {mintMetadata?.decimals
              ? (
                  currentStreamableAmount /
                  10 ** mintMetadata?.decimals
                ).toFixed(4)
              : currentStreamableAmount}
            {` ${mintMetadata?.symbol ? mintMetadata?.symbol : "UKN"}`}
          </Text>
        }
        infoLabel={`(in ${
          mintMetadata?.symbol ? mintMetadata?.symbol : "UKN"
        })`}
      />
      <KeyValue
        title={"Streamed amount"}
        valueComponent={
          <Text color="primary.900" fontSize={["14", "14", "16", "16", "16"]}>
            {"~ "}
            {mintMetadata?.decimals
              ? (account?.account?.totalAmount?.toNumber() -
                  account?.account?.streamableAmount?.toNumber()) /
                10 ** mintMetadata?.decimals
              : account?.account?.totalAmount?.toNumber() -
                account?.account?.streamableAmount?.toNumber()}
            {` ${mintMetadata?.symbol ? mintMetadata?.symbol : "UKN"}`}
          </Text>
        }
        infoLabel={`(in ${
          mintMetadata?.symbol ? mintMetadata?.symbol : "UKN"
        })`}
      />
      <KeyValue
        title="Mint"
        valueComponent={
          <Flex alignItems={"center"}>
            {mintMetadata?.logoURI && (
              <Image
                src={mintMetadata?.logoURI}
                alt="logo"
                w="4"
                h="4"
                mr="2"
              />
            )}
            <Text
              color="primary.900"
              fontSize={["14", "14", "16", "16", "16"]}
              cursor="pointer"
              _hover={{
                textDecoration: "underline",
              }}
              onClick={() => {
                const url = getUrls(
                  NETWORK,
                  account?.account?.mint?.toBase58(),
                  "address"
                ).explorer;
                window.open(url);
              }}
            >
              {mintMetadata?.name
                ? mintMetadata?.name
                : truncateAddress(account?.account?.mint?.toBase58())}
            </Text>
          </Flex>
        }
      />
      {isCreated ? (
        <KeyValue
          title="Receiver"
          valueComponent={
            <Text
              color="primary.900"
              fontSize={["14", "14", "16", "16", "16"]}
              cursor="pointer"
              _hover={{
                textDecoration: "underline",
              }}
              onClick={() => {
                const url = getUrls(
                  NETWORK,
                  account?.account?.recipient?.toBase58(),
                  "address"
                ).explorer;
                window.open(url);
              }}
            >
              {truncateAddress(account?.account?.recipient?.toBase58())}
            </Text>
          }
        />
      ) : (
        <KeyValue
          title="Sender"
          valueComponent={
            <Text
              color="primary.900"
              fontSize={["14", "14", "16", "16", "16"]}
              cursor="pointer"
              _hover={{
                textDecoration: "underline",
              }}
              onClick={() => {
                const url = getUrls(
                  NETWORK,
                  account?.account?.authority?.toBase58(),
                  "address"
                ).explorer;
                window.open(url);
              }}
            >
              {truncateAddress(account?.account?.authority?.toBase58())}
            </Text>
          }
        />
      )}
      <Flex alignItems={"center"} mt="4">
        {isCreated ? (
          <Button
            w="full"
            mt="4"
            isLoading={cancelLoading}
            loadingText="Cancelling..."
            onClick={onClickCancelConstantFlux}
          >
            Cancel
          </Button>
        ) : (
          <Button
            w="full"
            bg="primary.500"
            color="primary.900"
            _hover={{
              backgroundColor: "primary.500",
              color: "primary.900",
            }}
            isLoading={claimLoading}
            loadingText="Claiming..."
            onClick={onClickClaimConstantFlux}
          >
            Claim
          </Button>
        )}
        {/* <Button ml="2">
          <Icon as={FiRefreshCcw} />
        </Button> */}
      </Flex>
    </Flex>
  );
};

export default ConstantFluxCard;
