import { useState, useEffect, useCallback, useMemo } from "react";
import { json, useActionData, useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  TextField,
  Checkbox,
  Select,
  Grid,
  InlineStack,
  ChoiceList,
  LegacyCard,
  ResourceList,
  ResourceItem,
  Avatar,
  Image,
  Link,
} from "@shopify/polaris";
import { SearchIcon } from '@shopify/polaris-icons';
import { TitleBar, useAppBridge, Modal } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getAnnouncementDetails } from "../announcement.server";
import prisma from "../db.server";


// Loader function to authenticate the admin
export const loader = async ({ request }) => {
  const data = await authenticate.admin(request);
  const announcementData = await getAnnouncementDetails(data?.session?.shop);

  const response = await data?.admin.graphql(
    `#graphql
      query {
        collections(first: 5) {
          edges {
            node {
              id
              title
              image{
                id
                url
                altText
                height
                width
              }
              # products(first: 5) {
              #   edges {
              #     node {
              #       id
              #     }
              #   }
              # }
            }
          }
        }
      }`,
  );

  const collectionsData = await response.json();

  return { announcementData, collectionsData };

  // return { announcementData }
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const announcementText = formData.get("announcement_text");
  const backgroundColor = formData.get("background_color");
  const textColor = formData.get("text_color");
  const isEnabled = formData.get("enabled") === "on";
  const action = formData.get("action");
  const buttonText = formData.get("buttonText");
  const linkText = formData.get("linkText");
  const selectedPageForBar = formData.get("selectedPageForBar");
  // const collections = formData.get("selectedCollections");

  // const selectedCollections = collections.split('//')[1].split('/')[2]

  // const selectedCollections = collections.split




  const shopUrl = admin?.rest?.session?.shop; // Get the shop's URL from the authenticated admin session

  try {
    const updatedAnnouncement = await prisma.announcement.upsert({
      where: { shopUrl: shopUrl },
      update: {
        data: { announcementText, textColor, backgroundColor, isEnabled, action, buttonText, selectedPageForBar, linkText },
      },
      create: {
        shopUrl: shopUrl,
        data: { announcementText, textColor, backgroundColor, isEnabled, action, buttonText, selectedPageForBar, linkText },
      },
    });

    return {
      success: true,
      message: "Announcement bar text updated successfully!",
      updatedAnnouncement,
    };
  } catch (error) {
    console.error("Error updating announcement:", error);
    return {
      success: false,
      message: "Failed to update announcement bar text.",
      error: error.message,
    }, { status: 400 };
  }
};

export default function Index() {
  const announcementFetcher = useFetcher();
  const collectionsFetcher = useFetcher();
  const loaderData = useLoaderData();
  const actionData = useActionData()
  const [submitting, setSubmitting] = useState(false)
  const announcementDetails = loaderData?.announcementData?.data;
  const collections = loaderData?.collectionsData?.data?.collections;
  const [selected, setSelected] = useState(announcementDetails?.action ?? "No call to action");  // Ensure initial state is "Button"
  const [btnText, setBtnText] = useState(announcementDetails?.buttonText ?? "");
  const [linkText, setLinkText] = useState(announcementDetails?.linkText ?? "");
  const [selectedPageForBar, setSelectedPageForBar] = useState(announcementDetails?.selectedPageForBar ?? 'hidden');
  const [selectedCollections, setSelectedCollections] = useState([])

  const options = [
    { label: "No call to action", value: "No call to action" },
    { label: "Button", value: "Button" },
    { label: "Make entire bar clickable", value: "make entire bar clickable" },
  ];

  const resourceName = {
    singular: 'collection',
    plural: 'collections',
  }
  const items = collections?.edges?.map((item) => item?.node) || [];

  // States to handle form values and preview
  const [announcementText, setAnnouncementText] = useState(announcementDetails?.announcementText ?? "");
  const [backgroundColor, setBackgroundColor] = useState(announcementDetails?.backgroundColor ?? "#000000");
  const [textColor, setTextColor] = useState(announcementDetails?.textColor ?? "#FFFFFF");
  const [isEnabled, setIsEnabled] = useState(announcementDetails?.isEnabled ?? true);
  const shopify = useAppBridge();
  console.log(shopify);

  // Update the selected value when the Select dropdown changes
  const handleSelectChange = useCallback(
    (value) => {
      console.log('Selected value:', value); // Log the selected value for debugging
      setSelected(value); // Update state when select changes
    },
    [],
  );

  // Form submission handling
  const handleSubmit = () => {
    setSubmitting(!submitting);

    announcementFetcher.submit(
      {
        announcement_text: announcementText,
        background_color: backgroundColor,
        text_color: textColor,
        enabled: isEnabled ? "on" : "off",
        action: selected,
        buttonText: btnText ?? "",
        linkText: linkText ?? "",
        selectedPageForBar,
        selectedCollections: selectedCollections
      },
      { method: "POST" }
    );
  };

  // Update form values as user types or changes the color
  const handleTextChange = (value) => setAnnouncementText(value);
  const handleBackgroundColorChange = (value) => setBackgroundColor(value);
  const handleTextColorChange = (value) => setTextColor(value);
  const handleEnabledChange = () => setIsEnabled(!isEnabled);
  const handleBarVisibilityOnPage = useCallback((value) => setSelectedPageForBar(value), []);


  useEffect(() => {
    if (announcementFetcher.data?.success) {
      setSubmitting(!submitting)
      shopify.toast.show(announcementFetcher.data.message || "Settings saved!");
    }
  }, [announcementFetcher.data, shopify]);

  useEffect(() => {

    const fetchCollectionsList = async () => {
      collectionsFetcher.submit({ data: "collection" }, { key: "getCollections", method: "GET" })
    }


    if (selectedPageForBar === 'collection') {
      fetchCollectionsList()
    }

  }, [selectedPageForBar])


  const handleDeepLink = () => {
    const openUrl = `https://${shopify.config.shop}/admin/themes/current/editor?template=index&addAppBlockId=bd29b11c-592d-4856-be48-9c217c845a85/announcement&target=sectionGroup:header`;
    window.open(openUrl, "_blank");
  };


  return (
    <Page>
      <TitleBar title="Announcement Bar">
        <button onClick={handleSubmit} variant="primary" loading={submitting}>
          Save Announcement Bar
        </button>
      </TitleBar>
      <Card sectioned>
        <Text variant="headingLg">Preview:</Text>
        <Box
          padding="4"
          background={backgroundColor}
          style={{
            backgroundColor: backgroundColor,
            display: isEnabled ? "block" : "none",  // Show or hide based on `isEnabled`
            color: textColor,  // Apply text color
          }}
        >
          <p style={{ textAlign: "center", padding: 4 }}>{announcementText}

            <span style={{ marginLeft: "5px" }}>
              {selected === "Button" && (<Button>{btnText ?? ""}</Button>)}
            </span>

          </p>
        </Box>
      </Card>

      <Grid gap="500">
        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Text as="h2" variant="headingMd">
                  Customize the Announcement Bar
                </Text>
                <Text variant="bodyMd" as="p">
                  Configure the announcement bar for your storefront. You can customize the text, background color, text color, and whether the bar is visible.
                </Text>

                {/* Form Inputs */}
                <TextField
                  label="Announcement Text"
                  value={announcementText}
                  onChange={handleTextChange}
                  placeholder="Enter your announcement here"
                  multiline
                  maxLength={200}
                />
                <TextField
                  label="Background Color"
                  value={backgroundColor}
                  onChange={handleBackgroundColorChange}
                  type="color"
                />
                <TextField
                  label="Text Color"
                  value={textColor}
                  onChange={handleTextColorChange}
                  type="color"
                />
                <Checkbox
                  label="Enable Announcement Bar"
                  checked={isEnabled}
                  onChange={handleEnabledChange}
                />

                <Select
                  label="Call To Action"
                  options={options}
                  onChange={handleSelectChange}  // This updates the state
                  value={selected}  // Ensure value is linked to the selected state
                />

                {selected === "Button" && (
                  <BlockStack>
                    <InlineStack gap={"800"}>
                      <TextField type="text" label="Button Text" value={btnText} onChange={(value) => setBtnText(value)} />
                    </InlineStack>
                    <InlineStack gap={"800"}>
                      <TextField type="text" label="Link" value={linkText} onChange={(value) => setLinkText(value)} />
                    </InlineStack>
                  </BlockStack>
                )}

              </BlockStack>
            </Card>
          </Layout.Section>
        </Grid.Cell>

        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
          <Layout.Section>
            <Card>
              <BlockStack>
                <Text as="h2" variant="headingMd">Select Page to display the bar</Text>

                <ChoiceList
                  tone="magic"
                  choices={[
                    { label: 'Every Page', value: 'everyPage' },
                    { label: 'Home Page Only', value: 'index' },
                    { label: 'All Product Page', value: 'product' },
                    { label: 'All Products In Specific Collection', value: 'collection' },
                  ]}
                  selected={selectedPageForBar}
                  onChange={handleBarVisibilityOnPage}
                />

                <button style={{ width: "50%", marginTop: "10px" }} disabled={selectedPageForBar != "collection"} onClick={() => shopify.modal.show('my-modal')}>Select Collections</button>
                <Modal id="my-modal" variant="large">
                  <div style={{ marginLeft: "10px", padding: "10px" }}><Text variant="headingMd" as="h4">Select Collection</Text></div>

                  <LegacyCard>
                    <ResourceList
                      resourceName={resourceName}
                      items={items}
                      renderItem={renderItem}
                      selectedItems={selectedCollections}
                      onSelectionChange={setSelectedCollections}
                      selectable
                    />
                  </LegacyCard>

                  <TitleBar title="Add Collections">
                    <button variant="primary" disabled={selectedCollections?.length === 0} onClick={() => { shopify.modal.hide('my-modal') }}>Add</button>
                    <button onClick={() => { setSelectedCollections([]); shopify.modal.hide('my-modal') }}>Cancel</button>
                  </TitleBar>
                </Modal>

              </BlockStack>
            </Card>


            <Button

              variant="primary"

              tone="success"

              onClick={handleDeepLink}

            >

              Enable Announcement

            </Button>

          </Layout.Section>
        </Grid.Cell>
      </Grid>
    </Page>
  );
}


export function renderItem(item) {
  const { id, title, image } = item;
  const media = <Avatar customer size="md" name={name} />;

  return (
    <ResourceItem
      key={id}
      id={id}
      // url={url}
      // media={media}
      accessibilityLabel={`View details for ${title}`}

    >
      <Grid columns={{ md: 9 }}>
        {image?.url != undefined ? <Image alt={image?.altText ?? ""} source={image?.url} height={40} width={40} /> : <Avatar customer size="md" name={title} />}
        <Text variant="bodyMd" fontWeight="bold" as="h3">
          {title}
        </Text>
      </Grid>
      {/* <div>{location}</div> */}
    </ResourceItem>
  );
}

