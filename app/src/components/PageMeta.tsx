import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

interface Props {
  title?: string;
  description?: string;
  ogImage?: string;
}

const DEFAULT_TITLE = "Fluxus";
const DEFAULT_DESCRIPTION = "";
const URL = "";
const DEFAULT_OG_IMAGE = `${URL}/ogImage.png`;

const PageMeta: React.FC<Props> = ({ title, description, ogImage }) => {
  const { asPath, pathname } = useRouter();
  return (
    <>
      <Head>
        <title>{title ? `${title}` : DEFAULT_TITLE}</title>
        <meta
          name="description"
          content={description ? description : DEFAULT_DESCRIPTION}
        />
        <meta
          property="og:image"
          content={ogImage ? ogImage : DEFAULT_OG_IMAGE}
        />
        <link rel="icon" href="favicon.png" />
        <meta
          property="og:title"
          content={title ? `${title}` : DEFAULT_TITLE}
        />
        <meta
          property="og:description"
          content={description ? description : DEFAULT_DESCRIPTION}
        />
        <meta property="og:url" content={`${URL}${asPath}`} />
        <meta
          property="og:image"
          content={ogImage ? ogImage : DEFAULT_OG_IMAGE}
        />
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`${URL}${asPath}`} />
        <meta
          property="twitter:title"
          content={title ? `${title}` : DEFAULT_TITLE}
        />
        <meta
          property="twitter:description"
          content={description ? description : DEFAULT_DESCRIPTION}
        />
        <meta
          property="twitter:image"
          content={ogImage ? ogImage : DEFAULT_OG_IMAGE}
        />
      </Head>
    </>
  );
};

export default PageMeta;
