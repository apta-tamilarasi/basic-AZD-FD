const request = require('request');
const Buffer = require('buffer').Buffer;

exports = {

  GellALLComments: function (args) {


    return new Promise(async (resolve, reject) => {
      try {
        const data = await $request.invokeTemplate("getAzureComments", {
          context: {
            azure: args.azure,
            project: args.project,
            id: args.id,
          },
        });
        const parsedDetails = JSON.parse(data.response);
        resolve(parsedDetails);
      } catch (error) {
        console.error("error in GellALLComments", error);
        reject(error);
      }
    });
  },

  GetallAzureUsers:async function(args) {
    const data = await recursionFetch(args);
       console.log(data.length);
       
       renderData(null,data);
  },     
  authentication: async function (args) {    
    console.log("authentication args", args);
    // console.log("iparams: ", args.iparams);
    const attachmentUrls = await Addattach(args);
    for (let index = 0; index < attachmentUrls.length; index++) {
      const { url } = JSON.parse(attachmentUrls[index]);
      // console.log("attachmentUrls url:", url);
      const newattach = {
        op: "add",
        path: "/relations/-",
        value: {
          rel: "AttachedFile",
          url: url,
          attributes: {
            comment: "Spec for the task",
          },
        },
      };
      args.body_new.push(newattach);
    }
 
    try{
      const data = await $request.invokeTemplate("newWorkItemSubmit", {
                    context:{
                        "cus_project_id":args.cus["/fields/System.project_id"],
                        "cus_workItem_id":args.cus["/fields/System.workItem_id"]
                    }, 
                    body: JSON.stringify(args.body_new)
                })
              console.log("newWorkItemSubmit",JSON.parse(data.response));
              // console.log("newWorkItemSubmit",data);

              const azureRes = JSON.parse(data.response);
              console.log("azureRes: ", azureRes);
              // addTagTickets();

              if(data.status===200){
                // console.log(data);
                renderData(null, data);
              }
                }
                catch(err){
            
                  console.log(err);
                  // console.log(JSON.parse(err.response));
                  renderData(err, null);
                }
  },
  
  AddComments: async function (args) {
    const tag =
      "<div class='panel panel-warning' style='border-color: #faebcc;margin-bottom: 20px;background-color: #fff;border: 1px solid transparent;border-radius: 4px;-webkit-box-shadow: 0 1px 1px rgb(0 0 0 / 5%);box-shadow: 0 1px 1px rgb(0 0 0 / 5%);font-size: 14px' data-identifyelement='352'>" +
      "<div class='panel-heading' style='color: rgb(0 0 0 / 90%);background-color: #c3d6b1d4;border-color: #faebcc;padding: 10px 15px;border-bottom: 1px solid transparent;border-top-left-radius: 3px;border-top-right-radius: 3px' data-identifyelement='353'>Comment from Freshdesk: #" +
      args.ticket_id +
      " </div>" +
      "<div class='panel-body' style='padding: 15px;background-color: #c3d6b129;' data-identifyelement='354'>" +
      "<strong data-identifyelement='355'>Freshdesk:&nbsp;</strong>&nbsp;" +
      "<a href='https://" +
      args.fd_domain +
      "/a/tickets/" +
      args.ticket_id +
      "' target='_blank' rel='noreferrer' heap-ignore='true' data-identifyelement='356'>#" +
      args.ticket_id +
      "</a>&nbsp;connected successfully." +
      "</div>" +
      '<div class="panel-footer" style="padding: 10px 15px;background-color: #c3d6b157;border-top: 1px solid rgb(200 200 200);border-bottom-right-radius: 3px;border-bottom-left-radius: 3px" data-identifyelement="357">' +
      'By: <em data-identifyelement="360">' +
      args.name +
      '"&lt;' +
      args.email +
      '&gt;"</em>' +
      "</div>" +
      "</div>";



    try {
      const response = await $request.invokeTemplate("postAddComments", {
        context: {
          url: args.url,
        },
        body: {
          text: tag,
        },
      });
      console.log("Response " + JSON.stringify(response.response));
    } catch (err) {
      console.error("Error " + JSON.stringify(err));
    }
  },
  addMultipleNotes: async function (args) {
    // let id = args.items_arr;


    const tag =
      "<div class='panel panel-warning' style='border-color: #faebcc;margin-bottom: 20px;background-color: #fff;border: 1px solid transparent;border-radius: 4px;-webkit-box-shadow: 0 1px 1px rgb(0 0 0 / 5%);box-shadow: 0 1px 1px rgb(0 0 0 / 5%);font-size: 14px' data-identifyelement='352'>" +
      "<div class='panel-heading' style='color: rgb(0 0 0 / 90%);background-color: #c3d6b1d4;border-color: #faebcc;padding: 10px 15px;border-bottom: 1px solid transparent;border-top-left-radius: 3px;border-top-right-radius: 3px' data-identifyelement='353'>Comments from Freshdesk: #" +
      '<a href="https://' +
      args.fd_domain +
      "/a/tickets/" +
      args.ticket_id +
      '" target="_blank" rel="noreferrer" heap-ignore="true" data-identifyelement="358">' +
      args.ticket_id +
      "</a>" +
      " </div>" +
      "<div class='panel-body' style='padding: 15px' data-identifyelement='354'>" +
      args.notes +
      "</div>" +
      '<div class="panel-footer" style="padding: 10px 15px;background-color: #c3d6b157;border-top:  1px solid rgb(200 200 200);border-bottom-right-radius: 3px;border-bottom-left-radius: 3px" data-identifyelement="357">' +
      ' <div class="pull-right" style="float:right" data-identifyelement="359">By: <em data-identifyelement="360">' +
      args.name +
      '"&lt;' +
      args.email +
      '&gt;"</em>' +
      "</div>" +
      "</div>" +
      "</div>";



    try {
      const response = await $request.invokeTemplate("postMultipleNotes", {
        context: {
          project: args.project,
          items_arr: args.items_arr,
        },
        body: {
          text: tag,
        },
      });
      console.log("Response " + JSON.stringify(response.response));
    } catch (err) {
      console.error("Error " + JSON.stringify(err));
    }
  },
}
function storeAttachment(attachmentObj) {
  const { name, attachment_url, content_type, project_id, iparams } = attachmentObj;
  const bufferd = [];
  // console.log("attachment_url...",attachment_url);
  console.log("content_type...",content_type);

  return new Promise((resolve, reject) => {
    // Ensure `bufferd` is initialized properly
    request.get(attachment_url)
      .on('data', (data) => {
        // Pushing data into the buffer
        bufferd.push(data);
      })
      .on('error', (err) => {
        console.error("Error while fetching attachment:", err);
        reject(err); // Handle errors during data fetching
      })
      .on('complete',  () => {
        try {
          const buffer = Buffer.concat(bufferd);

          const host = iparams.azure_url;
          const fullURL = `https://${host}/${project_id}/_apis/wit/attachments?fileName=${name}&api-version=5.1`;

          console.log("fullURL...",fullURL);
          
          const options = {
            Authorization: iparams.azuretoken,
            'Content-Type': 'application/octet-stream'
          };

          // Making POST request to Azure to upload the attachment
          request.post(fullURL, {
            headers: options,
            body: buffer,
            encoding: null
          }, (error, response, body) => {
            if (error) {
              console.error('Error during upload:', error);
              return reject(error);
            }
            console.log('statusCode:', response && response.statusCode);

            // Handle 404 error
            if (response && response.statusCode === 404) {
              return reject(new Error("Attachment URL not found (404)"));
            }

            resolve(body); // Resolve the body when request succeeds
          });
        } catch (error) {
          console.error("Error during attachment processing:", error);
          reject(error); // Catch any errors during processing
        }
      });
  });
}

function Addattach(args) {

  
  const attach = args.attachments;
  // console.log("attach...",attach);
  
  return new Promise(async (resolve, reject) => {
    try {
      const attachmentPromises = [];

      for (let k = 0; k < attach.length; k++) {
        const { name, attachment_url, content_type } = attach[k];

        // Pushing promises without awaiting
        const attachmentPromise = await storeAttachment({ name, attachment_url, content_type, project_id: args.project_id, iparams: args.iparams });
        console.log("attachmentPromise;;;",attachmentPromise);
        
        attachmentPromises.push(attachmentPromise);
        console.log("attachmentPromises;;;;;;;;",attachmentPromises);
      }

      // Wait for all promises to resolve
      const attachmentRes = await Promise.all(attachmentPromises);
      resolve(attachmentRes); // Resolve all attachment responses
    } catch (err) {
      console.error("Error in Addattach:", err);
      reject(err); // Catch and reject errors in Addattach
    }
  });
}

function recursionFetch(args,token = null, member = []) {
	console.log("recursionFetch...........");
  return new Promise((resolve)=>{
    // let url = "https://vsaex.dev.azure.com/flashmobilevending/_apis/userentitlements?api-version=7.1-preview.3&$orderBy=name asc"
    let url = `https://vssps.${args.azure}/_apis/graph/users?api-version=6.0-preview.1`;
    if(token){
      url = url + `&continuationToken=${token}`
    }
    const options =  {
        url: url,
        method: "GET",
        headers: {
           'Authorization':args['iparams'].azuretoken,//'Basic OnR2cW0zYjQzN3dkdTdibXJ6dG1lanEzeTUyeXlkNG96eW9vbWx2NHVybG5kZHFoZmR2d3E=',//args['iparams'].azuretoken,
        'content-Type':'application/json-patch+json'
        }
      };
console.log("options...",options);
    request(options,function (error, response, body) {
	if(body)
       {    
			//console.log("body...",body);
			console.log("error...",error);
			const { value} = JSON.parse(body);
			// console.log(member);
			member = [...member, ...value];
			//member = member.concat(value);  
			// console.log(members.map(e=> e.user.displayName));
			if(response.headers['x-ms-continuationtoken']){
        resolve(recursionFetch(args,response.headers['x-ms-continuationtoken']));
			}else{
        resolve(member);
			}}else{
        resolve(member);}
      }
    );
  })
}
