import React from "react";
import { useState, useEffect,useContext,useCallback,useRef } from "react";
import Loader from "monday-ui-react-core/dist/Loader";
import { Select, Input, InputNumber,DatePicker,Spin  } from 'antd';
import { Form,Button, Upload} from 'antd';
import { ConfigProvider, theme } from "antd";
import Context from '../authorization/Context';
import "monday-ui-react-core/dist/main.css";
const { TextArea } = Input;
import { Typography } from 'antd';
const { Title } = Typography;
import TreeSample from "./TreeOptionModal";
import ReactQuill from 'react-quill';
import { Quill } from "react-quill";
import 'react-quill/dist/quill.snow.css';
import '../styles/createWorkItem.css'
import { LoadingOutlined } from '@ant-design/icons';

const AzureWorkItemCreation = (props) => {
console.log("props in create",props);
client.instance.resize({ height: "600px" });

    const sendMessageToParent = (status, content) => {
        client.instance.send({
            message: {
                status: status,
                content: content
              }
        })
        .then(() => {
            console.log("Message sent successfully from createworkitem modal!");
        })
        .catch((error) => {
            console.error("Error sending message from createworkitem modal:", error);
        });
    };
    let iparamsContent = props.client.services.EventAPI.context.settings
    let AzureUrl = props.client.services.EventAPI.context.settings.azure_url;
    let fsDomain = props.client.services.EventAPI.context.settings.domain;

    const inputRef = useRef();
    const db_config = useContext(Context);
    const [form] = Form.useForm(); 
    const [ticketID, setticketID] = useState();
    const [ticketstatus, setticketstatus] = useState();
    const [ticketcreatedAt,setticketcreatedAt]=useState();
    const [agentName, setagentName] = useState();
    const [agentEmail, setagentEmail] = useState();
    const [shouldRenderTreeSample, setShouldRenderTreeSample] = useState(false);
    const [optionForProject, setProject] = useState();
    const [optionForWorkItem, setWorkItem] = useState([]);
    const [apiWorkTypeData, setWorkTypeData] = useState([]);
    const [mandFields, setmandFields] = useState([]);
    const [mondayTitle, setmondayTitle] = useState({});
    const [dynamicValues, setdynamicValues] = useState({"project_id":"",workItem_id:""});
    const [loadings, setLoadings] = useState(false);
    const [Landingloadings, setLandingloadings] = useState(true);
    const [worktypeloadings, setWorktypeloadings] = useState(true);
    const [fieldsloadings, setFieldsloadings] = useState(false);
    const [projectId, setProjectId] = useState();
    const [attach, setAttach] = useState();
    const [ticketDescription, setTicketDescription] = useState("");
    const [attachmentName, setAttachmentName] = useState([{}]);
    const [isAttachAvailable, setIsAttachAvailable] = useState(false);
    const [workItemSelected, setWorkItemSelected] = useState(false);
    const [projectSelected, setprojectSelected] = useState(false);

      
    useEffect(() => {
        
        getProject();
        async function getProject () {
            try{
                // let simulateError = true; 

                // if (simulateError) {
                //   throw { status: 429, message: "Rate limit exceeded" };
                // }
                let data = await props.client.request.invokeTemplate("getAzureProjects", {})
            //   console.log("newWorkItemGetProject",JSON.parse(data.response));

              let projectsObj = JSON.parse(data.response).value;
            //   console.log("projectsObj: ", projectsObj);

                          setTimeout(function(){
                // setProject(azureRes.value.map(e => ({ label: e.name, value: e.id })));
                const sortedProjects = projectsObj.slice().sort((a, b) => {
                    const parseName = (str) => {
                      const match = str.match(/^(.*?)(\d+)?$/);
                      return [match[1]?.trim(), parseInt(match[2] || '0', 10)];
                    };
                  
                    const [textA, numA] = parseName(a.name);
                    const [textB, numB] = parseName(b.name);
                  
                    return textA.localeCompare(textB) || numA - numB; // Sort by text, then by number
                  });
                   setProject(sortedProjects.map(e => ({ label: e.name, value: e.id })));
                setLandingloadings(false);
            }, 500);
              
                }
                catch(err){
                    if (err.status === 429) {
                        sendMessageToParent('error','Rate limit exceeded. Please try again after 1 minute.');   
                            client.instance.send({ message: "rateLimitError" });
                            client.instance.close()
                    } else {
                        sendMessageToParent('error','An error occurred while creating the work item. Please try again.');   
                        console.log("Error in getProject of createworkitem",err);  
                    }
                }
        }

props.client.data.get("ticket").then(
    function(data){
        console.log("ticket data....:", data);
        // console.log("ticket description data....:", data.ticket.description);
        setticketID(data.ticket.id);
        setticketcreatedAt(data.ticket.created_at);
        setticketstatus(data.ticket.status)
        
        setmondayTitle({"/fields/System.Title":data.ticket.subject,"/fields/System.Description":data.ticket.description});
        
        setTicketDescription(data.ticket.description);
        const attachmentDetailsOne = data.ticket.attachments || [];
        let attachmentsArray = [];
        
        for (let i = 0; i < attachmentDetailsOne.length; i++) {
            let attachmentNameObject = { "name": attachmentDetailsOne[i].name };
            attachmentsArray.push(attachmentNameObject);
        }
        setIsAttachAvailable(true)
        setAttachmentName(attachmentsArray);
        setAttach(attachmentDetailsOne);  
    }
).catch((err) => {
    console.log("Error in getting ticketdetails of createworkitem",err);
})


getAgent();
async function getAgent () {
    try{
        // let simulateError = true; 

        //         if (simulateError) {
        //           throw { status: 429, message: "Rate limit exceeded" };
        //         }
        let data = await props.client.request.invokeTemplate("getAgent", {})

      let projectsObj = JSON.parse(data.response);
      
    setagentName(projectsObj.contact.name);
    setagentEmail(projectsObj.contact.email)
      
        }
        catch(err){
            if (err.status === 429) {
                sendMessageToParent('error','Rate limit exceeded. Please try again after 1 minute.');
                client.instance.send({ message: "rateLimitError" });
                            client.instance.close()
            } else {
                sendMessageToParent('error','An error occurred while creating the work item. Please try again.');   
                console.log("Error in getAgent of createworkitem",err);
            }
        }
}
    }, []);
    
    const handleProjectChange = async (event, data) => {
        
        // Reset the work item field when the project changes
        form.setFieldsValue({
            '/fields/System.workItem_id': undefined,
        });
    
        // Only proceed if the selected project ID is different from the current one
        if (event && event !== projectId) {
            setProjectId(event);
            // setShouldRenderTreeSample(true); // Set to true to render TreeSample
            setmandFields([]);
            setWorkItem([]);
            setWorktypeloadings(true);
            setprojectSelected(true)
            
            // AreaCreate(event);
            form.setFieldsValue({
                '/fields/System.AreaPath': undefined,
                '/fields/System.IterationPath': undefined,
              });
    // console.log("evennt",event);
    // console.log("data",data);

            try {
                // let simulateError = true; 

                // if (simulateError) {
                //   throw { status: 429, message: "Rate limit exceeded" };
                // }
                let workItemTypesData = await props.client.request.invokeTemplate("getAzureWorkItemTypes", {
                    context: {
                        "eventValue": event
                    }
                });

                let projectsObj = JSON.parse(workItemTypesData.response).value;
                // console.log("projectsObj: ", projectsObj);
    
                // Filter work item types that are not required
                let filterSomeFields = projectsObj
                    .filter(e => !["Shared Parameter", "Code Review Request", "Code Review Response", "Feedback Request"].includes(e.name))
                    .map(e => ({ label: e.name, value: e.name }));
    
                setWorkTypeData(projectsObj);
    
                // Set filtered work items
                setWorkItem(filterSomeFields.filter(e => e != null));
                setWorktypeloadings(false);
                setdynamicValues({ ...dynamicValues, [data]: event });
            } catch (err) {
                if (err.status === 429) {
                    sendMessageToParent('error','Rate limit exceeded. Please try again after 1 minute.');
                    client.instance.send({ message: "rateLimitError" });
                            client.instance.close()
                }else{
                sendMessageToParent('error','An error occurred while creating the work item. Please try again.');   
                console.log("Error in getAzureWorkItemTypes of createworkitem",err);
                }
            }
        } else if (!event) {
            // If no project is selected, reset the tree and values
            setShouldRenderTreeSample(false);
            setdynamicValues({ ...dynamicValues, [data]: "" });
        }
    };
    

    const handleWorkItemChange = async (event, data) => {
        
        // console.log("handleWorkItemChange data", {...dynamicValues,[data]:event});
        setdynamicValues({...dynamicValues,[data]:event}); 

        
        setFieldsloadings(true);
        setWorkItemSelected(true);
        setmandFields([]);
         
        
        let listMand;
        let listype = apiWorkTypeData.filter(e => {
            if (e.name === event) return listMand = e.fields.filter(e1 => e1.alwaysRequired === true && e1.defaultValue == null)
        });
        try{
            let data = await props.client.request.invokeTemplate("GetWorkItemFields", {
                context: {
                    "project_id": dynamicValues.project_id
                }
            })

        //   console.log("newWorkItemGetFields",JSON.parse(data.response));

          let a = JSON.parse(data.response);
        // console.log("aaaaaaaaaaaa....",a);
        let list_ = a.value.filter((elem) => {
            // Check if the field is mandatory or if it is the "Description" field
            return listMand.find(({ referenceName }) => elem.referenceName === referenceName) || elem.referenceName === "System.Description";
        });
        
        // console.log("list_.........", list_);
        var arr_obj =[];
        

        try{
            
            let ExpandAllData = await props.client.request.invokeTemplate("ExpandGetWorkItemFields", {
                context: {
                    "project_id": dynamicValues.project_id,
                    "eventValue": event
                } 
            })

          let resExpand = JSON.parse(ExpandAllData.response).value;
        // console.log("resExpand.....",resExpand);
       for(let i=0;i<list_.length;i++){
            let obj = {};            
            let a12 = resExpand.filter(f=>f.referenceName === list_[i].referenceName && f.allowedValues.length>0);
            if(list_[i].isPicklist === true){

                try{
                    
                    let data = await props.client.request.invokeTemplate("AzureProcessesList", {
                        context: {
                            "picklistId": list_[i].picklistId
                        }
                    })
                  let a11 = JSON.parse(data.response);
                  let a11Items = a11.items
                obj["type"] = list_[i].type;
                obj["isPicklist"] = list_[i].isPicklist;
                obj["isIdentity"] = list_[i].isIdentity;
                obj["name"] = list_[i].name;
                obj["referenceName"] = list_[i].referenceName;     
                obj["values"] = a11Items.map(e=>({ label: e, value: e }));
            }
            catch(err){
                if (err.status === 429) {
                    sendMessageToParent('error','Rate limit exceeded. Please try again after 1 minute.');
                    client.instance.send({ message: "rateLimitError" });
                            client.instance.close()
                } else {
                    sendMessageToParent('error','An error occurred while creating the work item. Please try again.');   
                    console.log("Error in getting workitemtype process list",err);   
                }
            }     

            }else if(list_[i].isPicklist === false && list_[i].isIdentity === true){


                try{
                    
                    let data = await props.client.request.invokeTemplate("GetAzureUsers", {})    
                  let a11 = JSON.parse(data.response).value;
              
                obj["type"] = list_[i].type;
                obj["isPicklist"] = list_[i].isPicklist;
                obj["isIdentity"] = list_[i].isIdentity;
                obj["name"] = list_[i].name;
                obj["referenceName"] = list_[i].referenceName;     
                obj["values"] = a11.filter(f=>f.mailAddress !== "").map(e=>({ label: e.displayName, value: e.mailAddress })); // 
            }
            catch(err){
                if (err.status === 429) {
                    sendMessageToParent('error','Rate limit exceeded. Please try again after 1 minute.');
                    client.instance.send({ message: "rateLimitError" });
                            client.instance.close()
                } else {
                    sendMessageToParent('error','An error occurred while creating the work item. Please try again.');   
                    console.log("Error in GetAzureUsers",err); 
                }
            }              
 
            }  
            else{                
                obj["type"] = list_[i].type;
                obj["isPicklist"] = list_[i].isPicklist;
                obj["isIdentity"] = list_[i].isIdentity;
                obj["name"] = list_[i].name;
                obj["referenceName"] = list_[i].referenceName;   
                obj["values"] = a12.length>0 ? a12[0].allowedValues.map(e=>({ label: e, value: e })) : [];
                
            }
            arr_obj.push(obj);
       }
            setShouldRenderTreeSample(true); // Set to true to render TreeSample

       setmandFields(arr_obj.filter(e=>e.referenceName !=="System.AreaId" && e.referenceName !=="System.IterationId"));
    
       setFieldsloadings(false);

    }
    catch(err){
        if (err.status === 429) {
            sendMessageToParent('error','Rate limit exceeded. Please try again after 1 minute.');
            client.instance.send({ message: "rateLimitError" });
                            client.instance.close()
        }else{
            sendMessageToParent('error','An error occurred while creating the work item. Please try again.');   
      console.log("Error in ExpandGetWorkItemFields",err);
        }
    }

    }
    catch(err){
        if (err.status === 429) {
            sendMessageToParent('error','Rate limit exceeded. Please try again after 1 minute.');
            client.instance.send({ message: "rateLimitError" });
                            client.instance.close()
        } else {
            sendMessageToParent('error','An error occurred while creating the work item. Please try again.');   
           console.log("Error in GetWorkItemFields",err);
            
        }
    }

    }

    const onFinish = async cus => {
        
        // getNotes(ticketID)
        // console.log("onFinish in workitem creation: " ,cus);
        setLoadings(true);
    
            let body_new = [];
            // console.log("tict res", ticketDescription);

            const cleanDescription = (value) => {
                // Remove any HTML tags or empty content
                const cleanedValue = value.replace(/<p><br><\/p>/g, '').trim(); // Clean out empty <p><br></p>
                return cleanedValue;
            };

            cus["/fields/System.Description"] = cleanDescription(ticketDescription);

        // console.log("Description updated:", cus["/fields/System.Description"]);

            Object.keys(cus).forEach(key => cus[key] === undefined ? delete cus[key] : {});
            for (var key in cus) {
            // console.log(key, typeof cus[key],cus[key]);

            if( key!=="/fields/System.project_id" && key!=="/fields/System.workItem_id"){
                if(typeof cus[key] == 'object'){
                    //console.log("nnnnnnnnnn",key, typeof cus[key]);
                    let d = cus[key].$d;
                    let date = d.toLocaleDateString('en-US');
                    // console.log(date);
                    cus[key] = date;
                }
                let my_object = {};
                my_object.op = "add";
                my_object.path = key;
                my_object.from = null;
                if(key =="/fields/System.AreaPath"){
                    my_object.value =  cus[key].replace('\\Area', '')
                 }else if(key =="/fields/System.IterationPath"){
                    my_object.value =  cus[key].replace('\\Iteration', '')
                  }else{
                my_object.value = cus[key];
            }
                body_new.push(my_object);
            }
            }
            console.log("body_new...",body_new);
            // console.log("project id before authentication",projectId);
            // console.log("attach in cw",attach);
            
            client.request.invoke("authentication", {project_id: projectId, attachments: attach, cus: cus, body_new: body_new, iparams: iparamsContent})
            .then(
                async function (data2) {
                    console.log("authentication invoke data: ", data2);
                    let mainRes = data2.response;
                    console.log("mainRes: ", mainRes);
                    let azureRes = JSON.parse(mainRes.response);
                    console.log("azureRes: ", azureRes);                    
                                  if(mainRes.status===200){
             
                let workItem_id =azureRes.id
                let Workitem_status = azureRes.fields['System.State']
                // console.log("status workitem",Workitem_status);
                    freshserviceAddNote(azureRes.id);
                    commentAzure(azureRes.id);
                    sendMessageToParent('success','Work Item Connected successfully');
                      props.client.instance.close();             

              }else{
                sendMessageToParent('error',azureRes);
              }
                },
                function (err) {
    console.log("Error in creating workitem",err);
    if (err.status === 403) {
        const project = optionForProject.find(p => p.value === projectId);
        const projectName = project ? project.label : "Unknown Project";

        sendMessageToParent('error', 
            `The current access token does not have permissions to create work items under the "${projectName}".`);
        client.instance.close()
    } else {
        sendMessageToParent('error', 'An error occurred while creating the work item. Please try again.');
    }
                });          
    };

    const freshserviceAddNote = async (id) => {
    
        var tag = '<div style="display:none">' + AzureUrl + '</div>' + "<div class='panel panel-warning' style='border-color: #faebcc;margin-bottom: 20px;background-color: #fff;border: 1px solid transparent;border-radius: 4px;-webkit-box-shadow: 0 1px 1px rgb(0 0 0 / 5%);box-shadow: 0 1px 1px rgb(0 0 0 / 5%);font-size: 14px' data-identifyelement='352'>" +
            "<div class='panel-heading' style='color: #183247;background-color: rgba(222,236,249,1);border-color: #faebcc;padding: 10px 15px;border-bottom: 1px solid transparent;border-top-left-radius: 3px;border-top-right-radius: 3px' data-identifyelement='353'>Azure DevOps Integration:</div>" +
            "<div class='panel-body' style='padding: 15px;background-color:rgba(222,236,249,1)' data-identifyelement='354'>" +
            "<strong data-identifyelement='355' id='project_id_" + projectId + "'>Work Item:&nbsp;</strong>&nbsp;" +
            "<a href='https://" + AzureUrl + "/_workitems/edit/" + id + "' target='_blank' rel='noreferrer' heap-ignore='true' data-identifyelement='356'>#" + id + "</a>&nbsp;connected successfully." +
            "</div>" +
            '<div class="panel-footer" style="color: #6f7c87;text-align:right;padding: 10px 15px;background-color: rgba(222,236,249,1);border-top: 1px solid #ddd;border-bottom-right-radius: 3px;border-bottom-left-radius: 3px" data-identifyelement="357">' +
            'By: <em data-identifyelement="360">' + agentName + '"&lt;' + agentEmail + '&gt;"</em>' +
            "</div>" +
            "</div>";
    
        let data1 = {
            "body": tag,
            "private": true
        };
        try {
          
            let data = await props.client.request.invokeTemplate("AddNote", {
                context: {
                    "ticketId": ticketID
                },
                body: JSON.stringify(data1)
            });
        
            let projectsObj = JSON.parse(data.response);
            console.log("projectsObj: ", projectsObj);
                    
        
        } catch (err) {
            //console.log(err);
            if (err.status == 429) {
                // Show a warning toast for rate limit
                sendMessageToParent('error','Rate limit exceeded. Please try again after 1 minute.');
                client.instance.send({ message: "rateLimitError" });
                client.instance.close()
                // Retry after 1 minute
                setTimeout(() => {
                    freshserviceAddNote(id);
                }, 60000);
            } else {
                sendMessageToParent('error','An error occurred while creating the work item. Please try again.');   
                console.log("Error in freshservice AddNote",err);
            }
        }
        
    }
    
    const commentAzure = async (id) => {
        
        var tag = "<div class='panel panel-warning' style='border-color: #faebcc;margin-bottom: 20px;background-color: #fff;border: 1px solid transparent;border-radius: 4px;-webkit-box-shadow: 0 1px 1px rgb(0 0 0 / 5%);box-shadow: 0 1px 1px rgb(0 0 0 / 5%);font-size: 14px' data-identifyelement='352'>" +
        "<div class='panel-heading' style='color: rgb(0 0 0 / 90%);background-color: #c3d6b1d4;border-color: #faebcc;padding: 10px 15px;border-bottom: 1px solid transparent;border-top-left-radius: 3px;border-top-right-radius: 3px' data-identifyelement='353'>Comment from Freshdesk: #" + ticketID + " </div>" +
        "<div class='panel-body' style='padding: 15px;background-color: #c3d6b129;' data-identifyelement='354'>" +
        "<strong data-identifyelement='355'>Freshdesk:&nbsp;</strong>&nbsp;" +
        "<a href='https://" + fsDomain + "/a/tickets/" + ticketID + "' target='_blank' rel='noreferrer' heap-ignore='true' data-identifyelement='356'>#" + ticketID + "</a>&nbsp;connected successfully." +
        "</div>" +
        '<div class="panel-footer" style="padding: 10px 15px;background-color: #c3d6b157;border-top: 1px solid rgb(200 200 200);border-bottom-right-radius: 3px;border-bottom-left-radius: 3px" data-identifyelement="357">' +
        'By: <em data-identifyelement="360">' + agentName + '"&lt;' + agentEmail + '&gt;"</em>' +
        "</div>" +
        "</div>";

        try {
            // let simulateError = true; 

            // if (simulateError) {
            //   throw { status: 429, message: "Rate limit exceeded" };
            // }
            let data = await client.request.invokeTemplate("AddComments", {
                context:{
                    "modalData": id,
                    "project": projectId
                },
                body:JSON.stringify({
                    "text": tag
                  })
            })
            if(data.status == 200){
console.log("comment added in azure devops successfully");
            }
        } catch (error) {
            if (error.status === 429) {
                sendMessageToParent('error','Rate limit exceeded. Please try again after 1 minute.');
                client.instance.send({ message: "rateLimitError" });
                            client.instance.close()
                            setTimeout(() => {
                                commentAzure(id);
                            }, 60000);
            }else{
                sendMessageToParent('error','An error occurred while creating the work item. Please try again.');   
            console.log("Error in Adding comments in Azure devops",error.response);
            }
        }
    }

    const cleanDescription = (value) => {
        // Remove any HTML tags or empty content
        const cleanedValue = value.replace(/<p><br><\/p>/g, '').trim(); // Clean out empty <p><br></p>
        return cleanedValue;
    };
    const customSpinner = <LoadingOutlined style={{ fontSize: 16 }} spin />;
    return (
       
        <div className="new-work-item"  style={{ 
            height: worktypeloadings ? "auto" : "100vh", 
            overflowY: worktypeloadings ? "hidden" : "auto",
            overflowX: "hidden"
          }}>

        <ConfigProvider theme={{
            token: {colorPrimaryBg:'#ffff',colorBgBase: '#ffff',}
            }}>  

        <div className="moday-size">  
                {Landingloadings &&
                    <div  style={{"marginLeft":"50%","marginTop": "25%"}}><Loader color="var(--primary-color)" size={40}/></div>
                      
                }
              
    <div style={{"marginRight": "10px","marginTop":"10px"}}>
        {optionForProject && mondayTitle && Object.keys(mondayTitle).length > 0  &&  
        <Form 
            name="basic"     
            ref={mondayTitle} 
            initialValues={mondayTitle}     
            autoComplete="off"
            onFinish={onFinish}
            layout="vertical" 
            form={form}
        > 
        <div className="each-div">
        <Form.Item label={<span>Project <span style={{ color: 'red' }}>*</span></span>}>
        <Form.Item
          name="/fields/System.project_id"
          noStyle
          rules={[
            {
              required: true,
              message: 'Select the Project',
            },
          ]}
        >
        <Select placeholder="Select the Project" options={optionForProject} style={{ width: "100%" }}  id="project_id" onChange={(e) => handleProjectChange(e, 'project_id')} className="dropdown-stories-styles_with-chips drop-down"
                    showSearch optionFilterProp="label"  filterOption={(input, option) => option?.label?.toLowerCase().includes(input.toLowerCase())} />
                </Form.Item></Form.Item>
                    
                {projectId && (
  worktypeloadings ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <Spin
        indicator={customSpinner}
        style={{
          height: "32px",
        }}
      />
    </div>
  ) : (
    <Form.Item label={<span>Work Item Type <span style={{ color: 'red' }}>*</span></span>}>
    <Form.Item
      name={"/fields/System.workItem_id"} noStyle
      rules={[{ required: true, message: "Select the Work Item" }]}
    >
      <Select
        placeholder="Select the Work Item Type"
        options={optionForWorkItem}
        style={{ width: "100%" }}
        id="workItem_id"
        onChange={(e) => handleWorkItemChange(e, "workItem_id")}
        className="dropdown-stories-styles_with-chips drop-down"
        showSearch
        optionFilterProp="label"
        filterOption={(input, option) =>
          option?.label?.toLowerCase().includes(input.toLowerCase())
        }
        notFoundContent="No data"
      />
    </Form.Item></Form.Item>
  )
)}
                {shouldRenderTreeSample && (
        <TreeSample project_id={projectId} />
    )}
            </div>              
            
            { fieldsloadings &&
                <div  style={{"textAlign": "left","marginTop": "5%","marginLeft": "10%"}}> <Loader color="var(--primary-color)" size={24}/></div>
                    
            } 
            <div className="marginTop">    
            {
                mandFields && mandFields.length>0 && mandFields.map(e=>{
                    let newLength = e.values;
                    // console.log("attachmentName ", attachmentName)

                    if(e.type === "string" && e.name === "Title" && e.isPicklist===false && e.isIdentity === false)
                    return <div className="each-div">
                        <Form.Item  label={ <>{e.name} <span style={{ color: 'red' }}>*</span></>}>
                        <Form.Item name={'/fields/System.Title'} style={{ marginBottom: '4px' }} rules={[{ required: true, message: 'Enter the '+e.name}]}>
                        <Input placeholder={'Enter the '+e.name} id={'/fields/System.Title'} value=""/> 

                        </Form.Item></Form.Item></div> 
                    else if(e.values && e.values.length > 0) {
                    return <div className="each-div">
                        <Form.Item  label={ <>{e.name} <span style={{ color: 'red' }}>*</span></>}>
                        <Form.Item name={'/fields/'+e.referenceName} style={{ marginBottom: '4px' }} rules={[{ required: true, message: 'Select the '+e.name}]}>
                            <Select placeholder={'Select the '+e.name} allowClear options={e.values} className="dropdown-stories-styles_with-chips drop-down"
                             showSearch optionFilterProp="label"  filterOption={(input, option) => option?.label?.toLowerCase().includes(input.toLowerCase())} />
                        </Form.Item></Form.Item></div>    
                    }       
                    else if(e.type === "string" && e.values.length<=0)
                        return <div className="each-div"><Form.Item  label={ <>{e.name} <span style={{ color: 'red' }}>*</span></>}>
                        <Form.Item name={'/fields/'+e.referenceName} style={{ marginBottom: '4px' }} rules={[{ required: true, message: 'Enter the '+e.name}]}>
                        <Input placeholder={'Enter the '+e.name}/> 
                        </Form.Item></Form.Item></div>
                else if (e.type === "html" && e.values.length <= 0) {
                    if (e.name === "Description") {
                        return (
                            <div className="each-div"style={{ color: "red" }}>
<Form.Item  label={ <>{e.name} <span style={{ color: 'red' }}>*</span></>}>
<Form.Item name={'/fields/'+e.referenceName}
    valuePropName="value" style={{ marginBottom: '4px' }}
    rules={[
        {
            validator: (_, value) => {
                // Clean the value before validation
                const cleanedValue = cleanDescription(value);

                // console.log("Validator received cleaned value:", cleanedValue);
                
                if (!cleanedValue || cleanedValue.trim() === "") {
                    return Promise.reject(new Error("Enter the Description"));
                }
                return Promise.resolve();
            },
        },
    ]}
>
    <ReactQuill
        theme="snow"
        id={'/fields/System.Description'}
        value={ticketDescription}
        onChange={(value) => {
            setTicketDescription(value); 
            form.setFieldsValue({ '/fields/System.Description': value }); 
        }}
    />
</Form.Item></Form.Item>
                            </div>
                        );
                    } else if (e.name !== "Description") {
                        return (
                            <div className="each-div">
                              <Form.Item  label={ <>{e.name} <span style={{ color: 'red' }}>*</span></>}>
                              <Form.Item  name={'/fields/' + e.referenceName} style={{ marginBottom: '4px' }}
                                    rules={[
                                        { required: true, message: 'Enter the ' + e.name },
                                    ]}
                                >
                                    <TextArea placeholder={'Enter the ' + e.name} />
                                </Form.Item></Form.Item>
                            </div>
                        );
                    }
                }                
                    else if(e.type === "dateTime" && e.values.length<=0)return <div className="each-div">
                       <Form.Item  label={ <>{e.name} <span style={{ color: 'red' }}>*</span></>}>
                       <Form.Item name={'/fields/'+e.referenceName} style={{ marginBottom: '4px' }} rules={[{ required: true, message: 'Select the '+e.name }]}>
                            {/* showTime={{ format: 'HH:mm' }} */}
                            <DatePicker   placeholder={'Select the '+e.name}
                            format="DD/MM/YYYY hh:mm A" showTime={{ use12Hours: true }} style={{ width: "100%" }} className="dropdown-stories-styles_with-chips drop-down"/>
                        </Form.Item></Form.Item></div>
                    else if(e.values.length<=0 && (e.type === "integer" || e.type === "double"))return <div className="each-div">
                      <Form.Item  label={ <>{e.name} <span style={{ color: 'red' }}>*</span></>}>
                      <Form.Item name={'/fields/' + e.referenceName}style={{ marginBottom: '4px' }}
        rules={[
          { required: true, message: 'Enter the ' + e.name },
        ]}
      >
        {e.type === 'integer' ? (
          // Handle Integer Type (no decimals allowed)
          <InputNumber
            min={0}
            ref={inputRef}
            step={1} 
            onInput={(event) => {
              if (event && event.target) {
                const sanitizedValue = event.target.value.replace(/[^0-9]/g, ''); // Allow only digits
                inputRef.current.value = sanitizedValue;  
              }
            }}
            onKeyPress={(event) => {
              const charCode = event.which ? event.which : event.keyCode;
              const charStr = String.fromCharCode(charCode);
              if (!charStr.match(/[0-9]/)) {
                event.preventDefault(); 
              }
            }}
            placeholder={'Enter the ' + e.name}
            style={{ width: '100%' }}
            className="dropdown-stories-styles_with-chips drop-down"
          />
        ) : e.type === 'double' ? (
          <InputNumber
            min={0}
            ref={inputRef}
            step={0.01} // Decimal precision
            onInput={(event) => {
              if (event && event.target) {
                const sanitizedValue = event.target.value.replace(/[^0-9.]/g, ''); // Allow only digits and decimal point
                inputRef.current.value = sanitizedValue; // Update ref value for decimal input
              }
            }}
            onKeyPress={(event) => {
              const charCode = event.which ? event.which : event.keyCode;
              const charStr = String.fromCharCode(charCode);

              if (!charStr.match(/[0-9.]/)) {
                event.preventDefault(); // Block non-numeric and non-decimal input
              }

              // Prevent multiple decimal points for doubles
              if (charStr === '.' && event.target.value.includes('.')) {
                event.preventDefault();
              }
            }}
            placeholder={'Enter the ' + e.name}
            style={{ width: '100%' }}
            className="dropdown-stories-styles_with-chips drop-down"
          />
        ) : null}
      </Form.Item></Form.Item>
</div>      
     
                    else return <div>     </div>     
                    
                })
            }  
            <div>{
    isAttachAvailable && attachmentName.length > 0 && (
        <div>
            <Title level={5}>Attachments</Title>
            <Upload fileList={attachmentName}>
            </Upload>
        </div>
    )
}
            </div> 
            {workItemSelected && projectSelected && !fieldsloadings && !worktypeloadings && (
    <row>     
        <Form.Item wrapperCol={{ offset: 18, span: 30 }}>
            <Button type="primary" loading={loadings} htmlType="submit">
                Submit
            </Button>
        </Form.Item>               
    </row>
)}
            </div>           
                    
        </Form>
        }
    </div>          
        </div> 
        </ConfigProvider>          
    </div>
    )
};

export default AzureWorkItemCreation;
