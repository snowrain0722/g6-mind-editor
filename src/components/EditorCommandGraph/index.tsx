import { useState, useEffect, useRef } from 'react';
import G6 from '@/components/EditorCommandRegister';
import classnames from 'classnames'
import { useStores, observer } from '@/utils/mobx';
import { Card, message } from 'antd';
import { cloneDeep } from 'lodash';
import styles from './index.module.scss';

function Index(props) {

  const refInputEdit = useRef();
  const refGraph = useRef(null);
  const refMiniMap = useRef();

  const { editorStore } = useStores();
  const {
    setEditorGraph,
    setCurrentType,
    treeData,
    setData,
    setCurrentId,
    currentId,
    fontSize,
    addChildItem,
    setTreeData
  } = editorStore;

  const [graph, setGraph] = useState(refGraph.current);
  const [editFlag, setEditFlag] = useState(false);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    // 初始化
    setGraphInit();
  }, []);

  useEffect(() => {
    if (graph && treeData) {
      renderGraph() // 渲染画布
    }
  }, [treeData, graph])

  useEffect(() => {
    // 当编辑文本的内容改变时  更新数据的label
    // 根据文本的字数 修改节点的宽度
    if (!editFlag && currentId) {
      const item = graph.findById(currentId)
      const model = item.getModel()
      const fontSize = model.labelCfg.style.fontSize
      if (editValue) {
        graph.updateItem(item, {
          label: editValue,
          size: [(editValue.length + 2) * fontSize, model.size[1]]
        }, true)
        setData(treeData)
      }
    }
  }, [editFlag, currentId, editValue])

  const renderGraph = () => {
    graph.clear(); // 清除画布
    graph.data(cloneDeep(treeData)); // 传递数据
    graph.render(); // 渲染画布
    graph.fitView(); // 适应视图
  };

  // 编辑展示
  const inputShow = () => {
    setEditFlag(!editFlag);
  };

  // 修改值
  const inputChange = (event: any) => {
    const val = event.target.value;
    setEditValue(val);
  };

  const initEdit = (target, type) => {
    const edit = refInputEdit.current;
    const canvasXY = refGraph.current.getCanvasByPoint(target.x, target.y);
    setEditValue(() => "");
    edit.value = "";
    if (type === "node") {
      edit.style.left =
        `${canvasXY.x - (target.size[0] / 2) + 1}px`
      edit.style.top =
        `${canvasXY.y - (target.size[1] / 2) + 1}px`
      edit.style.width = `${target.size[0] - 2}px`
      edit.style.height = `${target.size[1] - 2}px`
      edit.style.fontSize = `${fontSize}px`
      edit.style.borderRadius = `6px`
      edit.style.background = `#FFF`
    }
    edit.focus();
  };

  // 画布配置
  const setGraphInit = () => {
    const minimap = new G6.Minimap({
      container: refMiniMap.current,
    })
    const graph = new G6.TreeGraph({
      container: 'mind_container'!,
      height: 800,
      plugins: [minimap],
      modes: {
        default: [
          {
            type: 'collapse-expand',
            onChange: function onChange(item, collapsed) {
              const model = item?.getModel();
              model.collapsed = collapsed;
              return true;
            },
          },
          'drag-canvas',
          'zoom-canvas',
        ],
        edit: []
      },
      defaultNode: {
        size: [26, 26],
        anchorPoints: [
          [0, 0.5],
          [1, 0.5],
        ],
        style: {
          fill: '#C6E5FF',
          stroke: '#5B8FF9',
        },
      },
      defaultEdge: {
        type: 'cubic-horizontal',
        style: {
          stroke: '#A3B1BF',
        },
      },
      layout: {
        type: 'mindmap',
        direction: 'H',
        getHeight: () => {
          return 26;
        },
        getWidth: () => {
          return 26;
        },
        getVGap: () => {
          return 10;
        },
        getHGap: () => {
          return 100;
        },
        getSide: () => {
          return 'right';
        },
      },
    });

    graph.on("node:click", (evt) => {
      const { item } = evt
      const model = item.getModel()
      const mode = graph.getCurrentMode()
      if (mode === "edit") {
        // 编辑模式 显示红框
        // 清除其他节点的选中状态
        if (editorStore.currentId && editorStore.currentId !== model.id) {
          const oldItem = graph.findById(editorStore.currentId)
          oldItem && graph.clearItemStates(oldItem, ["selected"])
        }
        const { states } = item._cfg
        if (states.includes("selected")) {
          graph.setItemState(item, "selected", false)
          graph.setItemState(item, "unselected", true)
          setCurrentId(null)
          setCurrentType(null)
        } else {
          graph.setItemState(item, "selected", true)
          graph.setItemState(item, "unselected", false)
          setCurrentId(model.id)
          setCurrentType("node")
        }
      }
    });

    graph.on("node:dblclick", (evt) => {
      const { item } = evt
      const model = item.getModel()
      const mode = graph.getCurrentMode()
      if (mode === "edit") {
        // 显示input编辑框  设置目标节点id 类型 初始化input样式
        inputShow()
        setCurrentId(model.id)
        setCurrentType("node")
        initEdit(model, "node")
      }
    });

    graph.on("node:drag", (evt) => {
      const { item, clientX, clientY } = evt
      const point = graph.getPointByClient(clientX, clientY)
      const model = item.getModel()
      item.toFront()
      item.updatePosition(point)

      if (model.id !== "1") {
        let source = item.getNeighbors("source")
        source = source[0]
        const targetEdges = source.getEdges()
        // 需要调整连接点的边
        let tartgetEdge = targetEdges.filter(i => {
          const m = i.getModel()
          if (m.target === model.id) {
            return i
          }
        })
        tartgetEdge = tartgetEdge[0]
        // 调整边的model
        const tM = tartgetEdge.getModel()
        // 调整边连接的终点坐标
        const tEndPoint = tM.endPoint
        // 调整边源节点  tM.sourceNode存在 但是获取不到 玄学
        const sNode = graph.findById(tM.source)
        // 获取源节点离终点坐标 最近的锚点
        const sLinkPoint = sNode.getLinkPoint(tEndPoint)
        // 获取最近的锚点的索引
        const sAnchorIndex = sLinkPoint.anchorIndex
        // 更新目标边的源锚点索引
        graph.update(tartgetEdge, {
          sourceAnchor: sAnchorIndex
        }, true)
      }
      graph.update(item, model)
      graph.paint()
    })

    refGraph.current = graph;
    setGraph(refGraph.current);
    setEditorGraph(refGraph.current);

  };

  document.onkeydown = (e) => {
    // 键盘按下操作
    e.preventDefault()
    const { keyCode } = e
    if (keyCode === 9 && editorStore.currentId) {
      // tab键 添加子节点
      addChildItem()
    }
    if (keyCode === 13 && editorStore.currentId) {
      // 回车时 找到目标节点 显示文本编辑框
      const model = graph.findDataById(editorStore.currentId)
      inputShow();
      setCurrentId(model.id)
      setCurrentType("node")
      initEdit(model, "node")
    }

    if (keyCode === 8 && editorStore.currentId) {
      // 按下Backspace按钮时删除节点
      if (editorStore.currentId === "1") {
        message.warning("根节点不能删除～")
        return
      }
      graph.removeChild(editorStore.currentId)
      graph.paint()
      setTreeData(graph.findDataById("1"))
    }
  }

  return (
    <div className={styles.mind}>
      <div className={styles.toolbar}></div>
      <div className={styles.content}>
        <div className={styles.container} id="mind_container">
          <input
            type='text'
            ref={refInputEdit}
            className={classnames(
              styles.inputEdit,
              !editFlag && styles.inputEditHidden
            )}
            onChange={inputChange}
            onBlur={inputShow}
          />
        </div>
        <Card size="small" title="缩略图" bordered={false}>
          <div id="miniMap" ref={refMiniMap} />
        </Card>
      </div>
    </div>
  )
};

export default Index;