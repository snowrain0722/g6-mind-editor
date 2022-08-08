import { makeAutoObservable } from 'mobx';
import { message } from 'antd';
import type { TreeGraph } from '@antv/g6';

class editorStore {

  graph: TreeGraph = null; // 画布
  currentType = null; // 当前选中的目标类型 node edge
  currentId = null; // 当前选中ID
  edit = false; // 编辑状态
  fontSize = 14; // 字体大小
  defaultFontSize = 14; // 默认字体大小

  // 初始数据
  treeData = {
    id: '1',
    parent: null,
    labelCfg: {
      style: {
        fontSize: this.defaultFontSize
      }
    },
    style: {
      radius: 6
    },
    anchorPoints: [[0.5, 0], [0.5, 1], [0, 0.5], [1, 0.5]], // 四个锚点
    children: [

    ]
  };

  constructor() {
    makeAutoObservable(this);
  };

  // 以下为actions方法
  setTreeData = (data) => {
    this.treeData = data
  };

  setCurrentLayout = (direction: string) => {
    const layout = {
      type: 'mindmap',
      direction,
      getHeight: () => {
        return 16;
      },
      getWidth: () => {
        return 16;
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
    };
    this.graph.changeLayout(layout);
    this.graph.paint();
    this.graph.fitView();
  };

  changelabelCfg = (value, type) => {
    // 修改label样式 文字大小 颜色
    if (this.currentId) {
      const target = this.graph.findDataById(this.currentId);
      this.graph.update(target.id, {
        labelCfg: {
          style: {
            [type]: value
          }
        }
      }, true);
      this.graph.paint();
      this.graph.fitView();
    }
  };

  setEdit = flag => {
    this.edit = flag;
  };

  setEditorGraph = (graph) => {
    this.graph = graph;
  };

  setData = data => {
    this.data = data;
  };

  setCurrentType = (type) => {
    this.currentType = type;
  };

  setCurrentId = (id) => {
    this.currentId = id;
  };

  addItem = (target) => {
    // 添加节点
    let id = null
    if (target.children && target.children.length > 0) {
      const tId = target.children[target.children.length - 1].id
      const cIds = tId.split("-")
      cIds[cIds.length - 1] = `${~~cIds[cIds.length - 1] + 1}`
      id = cIds.join("-")
    } else {
      // 子节点为空时 添加子节点
      id = target.id + '-' + 1
    }

    return {
      id: `${id}`,
      parent: `${target.id}`,
      label: "分支主题",
      labelCfg: {
        style: {
          fontSize: this.defaultFontSize
        }
      },
      style: {
        radius: 6,
      },
      // linkPoints: {
      //     top: true,
      //     bottom: true,
      //     left: true,
      //     right: true,
      //     size: 5,
      //     fill: '#fff',
      // },
      anchorPoints: [[0.5, 0], [0.5, 1], [0, 0.5], [1, 0.5]],
      children: []
    }
  }

  addChildItem = () => {
    if (!this.edit) {
      message.warning("请先切换编辑模式～")
      return
    }
    if (!this.currentId) {
      message.warning("请先选择目标节点～")
      return
    }
    const target = this.graph.findDataById(this.currentId)
    // 添加子节点
    const data = this.addItem(target)
    this.graph.addChild(data, this.currentId)
    this.setTreeData(this.graph.findDataById("1"))
    this.graph.paint()
    this.graph.fitView()
  }

  addPeerItem = () => {
    if (!this.edit) {
      message.warning("请先切换编辑模式～")
      return
    }
    if (!this.currentId) {
      message.warning("请先选择目标节点～")
      return
    }
    const target = this.graph.findDataById(this.currentId)
    // 获取父节点 添加子节点
    const parent = this.graph.findDataById(target.parent)
    if (!target.parent) {
      message.warning("根节点无法添加同级元素～")
      return
    }
    const data = this.addItem(parent)
    this.graph.addChild(data, target.parent)
    this.setTreeData(this.graph.findDataById("1"))
    this.graph.paint()
    this.graph.fitView()
  }

  changeModeToEdit = () => {
    // 点击编辑按钮时
    if (this.edit) {
      // 清除之前选中的节点选中状态
      if (this.currentId) {
        const oldItem = this.graph.findById(this.currentId)
        this.graph.clearItemStates(oldItem, ["selected"])
      }
      // 重设为默认状态
      this.graph.setMode("default")
      this.edit = false
    } else {
      this.graph.setMode("edit")
      this.edit = true
    }
  }

};

export default new editorStore();