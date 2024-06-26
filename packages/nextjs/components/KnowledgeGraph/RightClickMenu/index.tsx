/*
 * @Author: tohsaka888
 * @Date: 2022-10-08 13:20:39
 * @LastEditors: tohsaka888
 * @LastEditTime: 2022-10-09 14:07:23
 * @Description: 右键菜单
 */

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import MenuItem from "./MenuItem";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
    onlyShowCurrentNodeAndChildren,
    showAllNodes,
} from "../Controller/graphSlice";
import {
    moveCanvasToPosition,
    resetCanvas,
} from "../Controller/canvasConfigSlice";

import {
    useRightMenuEvent,
    useRightMenuEventDispatch,
} from "../Controller/RightMenuController";

const canvasItems = ["Some Thing", "Else", "Entirely"];
const nodeItems = ["One", "two", "three"];
const imageItems = ["JPG", "JPEG", "PNG", "BMP"];

function RightMenuContent() {
    const canvasConfig = useAppSelector((state) => state.canvasConfig);
    const dispatch = useAppDispatch();
    const event = useRightMenuEvent();
    const setEvent = useRightMenuEventDispatch();
    const type = useMemo(() => {
        if (event?.target) {
            const target = event.target as any;
            if (target.className.baseVal.includes("canvas")) {
                return "canvas";
            } else if (target.className.baseVal.includes("node")) {
                return "node";
            } else {
                return "canvas";
            }
        }
    }, [event]);

    const nodes = useAppSelector((state) => state.graph.nodes);

    const moveNodeToCenter = useCallback(() => {
        const nodeId = (event!.target as HTMLElement).getAttribute("node-id");
        const node = nodes.find((n) => n.id === nodeId)!;
        const canvas = document.getElementById("knowledge-graph-canvas")!;

        dispatch(
            moveCanvasToPosition({
                x: canvas.clientWidth / 2 - node.position.x,
                y: canvas.clientHeight / 2 - node.position.y,
            })
        );
    }, [dispatch, event, nodes]);

    const downloadSVG = useCallback(
        (type: string) => {
            const scaleSize = 5;
            const gElement = document.getElementById("graph-drag")!;
            const width =
                (gElement.getBoundingClientRect().width / canvasConfig.scale + 50) *
                scaleSize;
            const height =
                (gElement.getBoundingClientRect().height / canvasConfig.scale + 50) *
                scaleSize;
            const minX =
                (Math.min(...nodes.map((n) => n.position.x)) - 25) * scaleSize;
            const minY =
                (Math.min(...nodes.map((n) => n.position.y)) - 25) * scaleSize;

            const graph = document.getElementById("knowledge-graph-canvas")!;
            const clonedGraph = graph.cloneNode(true) as SVGSVGElement;

            clonedGraph.querySelectorAll(".nodes").forEach((ele) => {
                (ele as any).style.visibility = "visible";
                (ele as any).style.opacity = 1;
            });

            clonedGraph.querySelectorAll(".edges").forEach((ele) => {
                (ele as any).style.visibility = "visible";
                (ele as any).style.opacity = 1;
            });

            const scaleElement = clonedGraph.getElementById(
                "graph-scale"
            ) as SVGGElement;
            scaleElement.style.transform = `scale(${scaleSize})`;

            const dragElement = clonedGraph.firstChild! as SVGGElement;
            dragElement.style.transform = `translateX(${-minX}px) translateY(${-minY}px)`;

            let serializer = new XMLSerializer();

            let source =
                '<?xml version="1.0" standalone="no"?>\r\n' +
                serializer.serializeToString(clonedGraph);

            const image = new Image();
            image.src =
                "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

            image.width = width;
            image.height = height;

            let canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            let context = canvas.getContext("2d")!;
            context.fillStyle = "transparent";
            context.fillRect(0, 0, 10000, 10000);

            image.onload = function() {
                context.drawImage(image, 0, 0);
                let a = document.createElement("a");
                a.download = `图谱.${type.toLowerCase()}`;
                a.href = canvas.toDataURL(`image/${type.toLowerCase()}`, 1);
                a.click();
            };
        },
        [canvasConfig.scale, nodes]
    );

    const [isDownload, setIsDownload] = useState<boolean>(false);
    // const dispatchFullScreen = useDispatchFullScreen();

    return (
        <>
            <motion.div
                id={"right-menu"}
                initial={{
                    position: "fixed",
                    willChange: "transform",
                    top: "0px",
                    left: "0px",
                    opacity: 0,
                    transform: `translate3d(${event!.clientX}px, ${event!.clientY}px, 0)`,
                }}
                animate={{
                    opacity: 1,
                    transform: `translate3d(${event!.clientX}px, ${event!.clientY}px, 0)`,
                }}
            >
                {type === "canvas" ? (
                    <motion.div initial={{ border: "1px solid #dfdfdf" }}>
                        {!isDownload
                            ? canvasItems.map((item, index) => {
                                return (
                                    <MenuItem
                                        index={index}
                                        length={canvasItems.length}
                                        key={item}
                                        onClick={(value) => {
                                            if (value === "Else") {
                                                dispatch(resetCanvas());
                                                setEvent(null);
                                            }
                                            if (value === "Some Thing" || value === "Some Thing") {
                                                if (document.fullscreenElement) {
                                                    document.exitFullscreen();
                                                } else {
                                                    document
                                                        .getElementById("knowledge-graph-container")!
                                                        .requestFullscreen();
                                                }
                                                setEvent(null);
                                            }
                                            if (value === "Entirely") {
                                                setIsDownload(true);
                                            }
                                        }}
                                    >
                                        {item === "One"
                                            ? !document.fullscreenElement
                                                ? "Two"
                                                : "Three"
                                            : item}
                                    </MenuItem>
                                );
                            })
                            : imageItems.map((item, index) => {
                                return (
                                    <MenuItem
                                        key={item}
                                        index={index}
                                        length={imageItems.length}
                                        onClick={() => {
                                            downloadSVG(item);
                                            setEvent(null);
                                        }}
                                    >
                                        {item}
                                    </MenuItem>
                                );
                            })}
                    </motion.div>
                ) : (
                    <motion.div initial={{ border: "1px solid #dfdfdf" }}>
                        {nodeItems.map((item, index) => {
                            return (
                                <MenuItem
                                    key={item}
                                    index={index}
                                    length={nodeItems.length}
                                    onClick={() => {
                                        if (item === "One") {
                                            moveNodeToCenter();
                                        }

                                        if (item === "two") {
                                            const nodeId = (
                                                event!.target as HTMLElement
                                            ).getAttribute("node-id");
                                            const node = nodes.find((n) => n.id === nodeId)!;
                                            dispatch(onlyShowCurrentNodeAndChildren(node));
                                        }

                                        if (item === "three") {
                                            dispatch(showAllNodes(undefined));
                                        }
                                        setEvent(null);
                                    }}
                                >
                                    {item}
                                </MenuItem>
                            );
                        })}
                    </motion.div>
                )}
            </motion.div>
        </>
    );
}

function RightClickMenu() {
    const knowledgeGraphRef = useRef<HTMLElement>(null!);
    const setEvent = useRightMenuEventDispatch();
    const event = useRightMenuEvent();

    useEffect(() => {
        knowledgeGraphRef.current = document.getElementById(
            "knowledge-graph-container"
        ) as HTMLElement;

        return () => {
            setEvent(null);
        };
    }, [setEvent]);

    return (
        knowledgeGraphRef.current &&
        ReactDOM.createPortal(
            <>{event && <RightMenuContent />}</>,
            knowledgeGraphRef.current
        )
    );
}

export default React.memo(RightClickMenu);
