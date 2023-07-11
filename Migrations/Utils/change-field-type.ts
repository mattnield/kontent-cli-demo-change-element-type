import * as dotenv from "dotenv";
import { ManagementClient, ContentTypeModels, ContentTypeElements, ContentTypeResponses, WorkflowResponses, LanguageVariantModels } from "@kontent-ai/management-sdk"
import * as deliverySdk from '@kontent-ai/delivery-sdk';

dotenv.config({ path: '.env' });

export const ConvertTextToRichText = async (client: ManagementClient, contentTypeCodename: string, elementCodename: string, elementName: string, containerTag: string, contentGroupCodename: string | undefined) => {
  console.log(`Changing element type of ${contentTypeCodename}.${elementCodename} to ${elementName}...`);

  // Check if the element exists in the provided type and if it is a text element
  const contentTypeData: ContentTypeModels.ContentType = await client.viewContentType().byTypeCodename(contentTypeCodename).toPromise().then(response => response.data);

  if (contentTypeData.elements.find(element => element.type === "rich_text" && (element as ContentTypeElements.IRichTextElementData).codename === elementCodename)) {
    console.log(`Element ${elementCodename} not found in ${contentTypeCodename}.`);
    return;
  }

  // Create a new element of type Rich text
  console.log('Create a new element of type Rich text');
  const newElementCodename: string = `${elementCodename}_new`;
  const newRichTextElementData: ContentTypeModels.IModifyContentTypeData = getNewElementData(elementCodename, elementName, newElementCodename, contentGroupCodename);
  const newRichTextElement: ContentTypeResponses.ModifyContentTypeResponse = await client.modifyContentType()
    .byTypeCodename(contentTypeCodename)
    .withData([newRichTextElementData])
    .toPromise();

    console.log('Get the IDs of all content items of the type that we are interested in.');
  // Get the IDs of the elements that we're interested in
  const textElementId: string = newRichTextElement.data.elements
    .find(element => element.type === "text" && (element as ContentTypeElements.ITextElementData).codename === elementCodename)?.id as string;
  const richTextElementId: string = newRichTextElement.data.elements
   .find(element => element.type === "rich_text" && (element as ContentTypeElements.IRichTextElementData).codename === newElementCodename)?.id as string; 

  // Load the workflow steps
  const listWorkflowStepsResponse: WorkflowResponses.ListWorkflowStepsResponse = await client.listWorkflowSteps().toPromise();
  const workflowSteps: { id: string, name: string }[] = listWorkflowStepsResponse.data.map((step: any) => ({ id: step.id, name: step.name }));


  // Loop through _all_ language variants for the type
  const variantResponse: LanguageVariantModels.ContentItemLanguageVariant[] = await client
    .listLanguageVariantsOfContentType()
    .byTypeCodename(contentTypeCodename)
    .toPromise()
    .then(response => response.data.items);

  for (const variant of variantResponse) {
    const newValue: string = getNewValueByElementId(variant, containerTag, textElementId);

    switch (workflowSteps.find((step: { id: string, name: string }) => step.id === variant.workflowStep.id)?.name) {
      case "Published": // TODO: update any published items to use the new element
        console.log(`Item ID {${variant.item.id}} is published. Creating a new version.`);
        //await updatePublishedVersion(variant, newValue);
        console.log(`\tDone.`);
        break;
      case "Archived": // TODO: update any archived items to use the new element
        console.log(`Item ID {${variant.item.id}} is archived.`);
        //await updateArchivedVersion(variant, newValue);
        console.log(`\tDone.`);
        break;
      default: // update any draft items to use the new element
        console.log(`Item ID {${variant.item.id}} is not published or archived.`);
        await updateUnpublishedVersion(variant, newValue);
        console.log('\tDone.')
        break;
    }

  }

  // TODO: Delete the old element & rename the new element to the old element's codename
  await client
    .modifyContentType()
    .byTypeCodename(contentTypeCodename)
    .withData(
      [{
        op: "remove",
        path: `/elements/codename:${elementCodename}`
      },
      {
        op: "replace",
        path: `/elements/codename:${newElementCodename}/codename`,
        value: elementCodename
      }]
    )
    .toPromise()
    .then((r: ContentTypeResponses.ModifyContentTypeResponse) => {
      console.log('\tOld field removed/swapped');
    })
    .catch(e => {
      console.log('\tCould not remove old field');
      console.log(e);
    })

  async function updateUnpublishedVersion(variant: LanguageVariantModels.ContentItemLanguageVariant, newValue: string) {
    // Take a backup of the variant.
    const backup = Object.assign({}, variant);
    const previouslyPublished = await tryGetPublishedVersion(variant.item.id ?? '');

    if (previouslyPublished) {
      // copy published values to draft via upsert
      console.log('\tGet elements...')
      const upsertElements = Object.entries(previouslyPublished.elements)
        .filter((o: any) => o[1].type !== 'url_slug')
        .map((o: any) => ({ element: { codename: o[0] }, value: getValueForElementByType(o[1]) }));
      const publishedValue = upsertElements.find((o:any) => o.element.codename === elementCodename)!.value;
      const newPublishedValue = getNewValueByValue(publishedValue, containerTag);
      if (!upsertElements.find(item => item.element.codename === newElementCodename)) {
        upsertElements.push(({ element: { codename: newElementCodename }, value: newPublishedValue }))
      } else {
        upsertElements.find(item => item.element.codename === newElementCodename)!.value = newPublishedValue;
      }

      console.log('\tupdate published version.')
      await client
        .upsertLanguageVariant()
        .byItemId(variant.item.id!)
        .byLanguageId(variant.language.id!)
        .withData(builder => (upsertElements))
        .toPromise()
        .then(async r => {


          console.log('\tupserted')
          await client
            .publishLanguageVariant()
            .byItemId(variant.item.id!)
            .byLanguageId(variant.language.id!)
            .withoutData()
            .toPromise()
            .then(async response => {
              console.log('\t(Updated & published)');

              await client
                .createNewVersionOfLanguageVariant()
                .byItemId(variant.item.id!)
                .byLanguageId(variant.language.id!)
                .toPromise()
                .then(async response => {
                  console.log('\tcreating new variant...')
                  variant = Object.assign({}, backup);
                  console.log('\tRestored variant locally.')

                  const restoredElements = variant.elements.map(o => o._raw);
                  restoredElements.find(o => o.element.id === richTextElementId)!.value = newValue;

                  const publishedValue = restoredElements.find((o : any)=> o.element.id === richTextElementId)!.value as string;
                  const newPublishedValue = getNewValueByValue(publishedValue, containerTag);

                  console.log(`\t\tpub := ${publishedValue}\n\t\tnew := ${newPublishedValue}\n\t\tori := ${newValue}`);

                  await client
                    .upsertLanguageVariant()
                    .byItemId(variant.item.id!)
                    .byLanguageId(variant.language.id!)
                    .withData(builder => (restoredElements))
                    .toPromise()
                    .then(r => {
                      console.log('Upserted the original values');
                    })
                    .catch(e => {
                      console.log('Could not upsert the original values');
                    });
                })
                .catch(error => {
                  console.log("\tCould not restore draft");
                  console.log(error);
                });
            })
            .catch(error => {
              console.log('Could not publish version');
            });



          // restore original draft.
        })
        .catch(error => {
          console.log('NOT UPDATED');
          console.log(error.validationErrors);
          console.log(typeof upsertElements);
          console.log(upsertElements);
        });

      // restore original draft.
    } else {
      console.log('\tNo previous version.');
      await client
        .upsertLanguageVariant()
        .byItemId(variant.item.id!)
        .byLanguageId(variant.language.id!)
        .withData((builder) => [
          builder.richTextElement({
            element: { codename: newElementCodename },
            value: newValue
          })
        ])
        .toPromise()
        .then(() =>
          console.log('\tUpdated version.')
        );
    }
  }
}

const tryGetPublishedVersion = async (itemId: string) => {
  const deliveryClient = deliverySdk.createDeliveryClient({
    projectId: process.env["PROJECT_ID"] ?? ''
  });

  const responseData = await deliveryClient
    .items()
    .equalsFilter('system.id', itemId)
    .toPromise()
    .then(response => {
      if(response && response.data.items.length > 0) {
        return response.data.items[0]; }
        else {
          return null;
        }
    }).catch(() => null);

  return responseData;
}

const getValueForElementByType = (data: deliverySdk.IGenericElement) => {
  switch (data.type) {
    case "modular_content":
      return data.value.map((o: any) => ({ codename: o }));
    default:
      return data.value;
  }
}

const getNewValueByElementId = (variant: LanguageVariantModels.ContentItemLanguageVariant, tag: string, sourceElementId: string): string => {
  const currentvalue: string = variant.elements.find(e => e.element.id === sourceElementId)?.value as string;
  return currentvalue.startsWith("<") ? currentvalue : `<${tag}>${currentvalue}</${tag}>`;
}

function getNewElementData(elementCodename: string, elementName: string, newElementCodename: string, contentGroupCodename: string | undefined): ContentTypeModels.IModifyContentTypeData {
  const newRichTextElementData: ContentTypeModels.IModifyContentTypeData = {
    op: "addInto",
    path: "/elements",
    after: { codename: elementCodename },
    value: {
      name: elementName,
      codename: newElementCodename,
      type: "rich_text",
    }
  };

  // Move the item to the correct content group -- OPTIONAL
  if (contentGroupCodename) {
    newRichTextElementData.value["content_group"] = { codename: contentGroupCodename };
  }
  return newRichTextElementData;
}

const getNewValueByValue = (currentvalue : string, tag: string) => currentvalue.startsWith("<") ? currentvalue : `<${tag}>${currentvalue}</${tag}>`;

