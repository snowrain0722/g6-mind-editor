import G6 from '../Registers';
import classnames from 'classnames';
import { useStores } from '@/utils/mobx';
import { useState, useEffect, useRef } from 'react';
import { cloneDeep } from 'lodash';
import { Input, Card, message } from 'antd';
import EditorCommandToolbar from '../EditorCommandToolbar';
import styles from './index.module.scss';

const { TreeGraph, Minimap } = G6;
export default function Index() {

  const graphRef = useRef();
  const inputEditRef = useRef();

  const [graph, setGraph] = useState(graphRef.current);
  const [editValue, setEditValue] = useState("");

  const { editorStore } = useStores();

  useEffect(() => {
    // 初始化
    graphInit();
    console.log(editorStore);
  }, []);

  // 界面配置
  const graphInit = () => {
    //小地图
    const miniMap = new Minimap({
      container: 'miniMap'!,
    });
    // 画布
    const graph = new TreeGraph({
      container: 'mind_container'!,
      width: 1200,
      height: 800,
      modes: {
        default: [
          {
            type: 'collapse-expand',
            onChange: function (item, collapsed) {
              const model = item?.getModel();
              if (model) {
                model.collapsed = collapsed;
              }
              return true;
            },
          },
          'drag-canvas',
          'zoom-canvas',
        ],
        edit: []
      },
      // 布局
      layout: {
        type: 'mindmap',
        direction: 'LR',
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
      },
      plugins: [miniMap]
    });

    initEvent();
    initKeyboard();

    graphRef.current = graph;
    setGraph(graphRef);
  };

  // 事件监听
  const initEvent = () => {

  };

  // 键盘事件
  const initKeyboard = () => {

  };

  return (
    <div className={styles.mind}>
      <div className={styles.toolbar}>
        <EditorCommandToolbar />
      </div>
      <div className={styles.content}>
        <div className={styles.container} id="mind_container"></div>
        <Card size="small" title="缩略图" bordered={false}>
          <div id="miniMap" />
        </Card>
      </div>
    </div>
  )
}