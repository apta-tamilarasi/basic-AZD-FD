import React, { useEffect, useState } from "react";
import { CarryOutOutlined } from "@ant-design/icons";
import { Space, Switch, TreeSelect } from "antd";

import { Form } from "antd";

const treeData = [
  {
    value: "parent 1",
    title: "parent 1",
    icon: <CarryOutOutlined />,
    children: [
      {
        value: "parent 1-0",
        title: "parent 1-0",
        icon: <CarryOutOutlined />,
        children: [
          {
            value: "leaf1",
            title: "leaf1",
            icon: <CarryOutOutlined />,
          },
          {
            value: "leaf2",
            title: "leaf2",
            icon: <CarryOutOutlined />,
          },
        ],
      },
      {
        value: "parent 1-1",
        title: "parent 1-1",
        icon: <CarryOutOutlined />,
        children: [
          {
            value: "sss",
            title: "sss",
            icon: <CarryOutOutlined />,
          },
        ],
      },
    ],
  },
];

const TreeSample = (props) => {
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
  const [treeLine, setTreeLine] = useState(true);
  const [showLeafIcon, setShowLeafIcon] = useState(false);
  const [showIcon, setShowIcon] = useState(false);

  const [treeDataOne, setTreeDataOne] = useState([]);
  const [treeDataTwo, setTreeDataTwo] = useState([]);

  const [areaValue, setAreaValue] = useState();
  const [iterationValue, setIterationValue] = useState();
  const [form] = Form.useForm(); 

  const onChangeArea = (newValue) => {
    let replaceArea = newValue.replace('\\Area', '');
    setAreaValue(replaceArea);

  };
  const onChangeIteration = (newValue) => {
    let replaceIteration = newValue.replace('\\Iteration', '');
    setIterationValue(replaceIteration);

  };

  useEffect(() => {
    // console.log("useEffect triggered with project_id:", props.project_id);
    AreaCreate(0); 
    iterationCreate(0);
  }, [props.project_id]);
  

  async function AreaCreate(projects_list) {
    if(props.project_id){
      setAreaValue(null);
    }
    const mergeArea = (target, source) => {
      // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
      for (const key of Object.keys(source)) {
        if (source[key] instanceof Object)
          Object.assign(source[key], mergeArea(target[key], source[key]));
      }

      // Join `target` and modified `source`
      Object.assign(target || {}, source);
      // let mergeResults;
      let mergeResults = target;
      setTreeDataOne([mergeResults]);
      // console.log(mergeResults);
      return target;
    };

    try { 
     
      let data = await client.request.invokeTemplate("getAzureClassificationNodes", {
        context:{
          "project_id": props.project_id,
        }
      });
      console.log("areaTree", JSON.parse(data.response));
      var Areapath = [];
      const result_1 = JSON.parse(
        data.response
          .replace(/"name":/g, '"title":')
          .replace(/"children":/g, '"children":')
          .replace(/"path":/g, '"value":')
      );
      setTreeDataOne([result_1]);

    } catch (err) {
      if (err.status === 429) {
        sendMessageToParent('error','Rate limit exceeded. Please try again after 1 minute.');   
            client.instance.send({ message: "rateLimitError" });
            client.instance.close()
    } else {
        sendMessageToParent('error','An error occurred while creating the work item. Please try again.');   
        console.log("Error in getAzureClassificationNodes",err);  
    }
    }

  }

  async function iterationCreate(projects_list) {
    if(props.project_id){
      setIterationValue(null);
    }
    const mergeIteration = (target, source) => {
      // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
      for (const key of Object.keys(source)) {
        if (source[key] instanceof Object)
          Object.assign(source[key], mergeIteration(target[key], source[key]));
      }

      // Join `target` and modified `source`
      Object.assign(target || {}, source);
      let mergeResults = target;
      setTreeDataTwo([mergeResults]);
      return target;
    };

    try {
      // let simulateError = true; 

      // if (simulateError) {
      //   throw { status: 429, message: "Rate limit exceeded" };
      // }
      let data = await client.request.invokeTemplate("getAzureIterations", {
        context:{
          "project_id": props.project_id,
        }
      });
      console.log("getAzureIterations", JSON.parse(data.response));
      var Areapath = [];
      const result_1 = JSON.parse(
        data.response
          .replace(/"name":/g, '"title":')
          .replace(/"children":/g, '"children":')
          .replace(/"path":/g, '"value":')

      );

      setTreeDataTwo([result_1]);

    } catch (err) {
      if (err.status === 429) {
        sendMessageToParent('error','Rate limit exceeded. Please try again after 1 minute.');   
            client.instance.send({ message: "rateLimitError" });
            client.instance.close()
    } else {
        sendMessageToParent('error','An error occurred while creating the work item. Please try again.');   
        console.log("Error in getAzureIterations of createworkitem",err);  
    }
    }
  }

  return (

    <div>
      <Form.Item label={"Area"} name={'/fields/System.AreaPath'}>
        <TreeSelect
          treeLine={
            treeLine && {
              showLeafIcon,
            }
          }
          style={{
            width: 300,
          }}
          id="areaTree"
          // showCheckedStrategy="SHOW_PARENT"
          treeData={treeDataOne}
          treeIcon={showIcon}
          value={areaValue}
          onChange={onChangeArea}
          form={form}
        />
      </Form.Item>

      <Form.Item label={"Iteration"} name={'/fields/System.IterationPath'}>
      <TreeSelect
        treeLine={
          treeLine && {
            showLeafIcon,
          }
        }
        style={{
          width: 300,
        }}
        treeData={treeDataTwo}
        treeIcon={showIcon}
        value={iterationValue}
        onChange={onChangeIteration}
        form={form}
      />
            </Form.Item>

    </div>

  );
};

export default TreeSample;
