/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Text, Group, Line } from "react-konva";

interface ApartmentShape {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  fill?: string;
}

interface Apartment {
  id: string;
  number: number;
  info: string[];
  groupX: number;
  groupY: number;
  shapes: ApartmentShape[];
  highlightColor: string;
}

export default function FloorPlan() {
  const stageRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  const [selectedApt, setSelectedApt] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [floor, setFloor] = useState(7);
  const [entrance, setEntrance] = useState(8);
  const [modal, setModal] = useState<{ open: boolean; apt: Apartment | null }>({ open: false, apt: null });

  // apartments - recreating the exact floor plan from the image
  const apartments = [
    // Left apartment - complex layout
    {
      id: "apt-left",
      number: 2,
      info: ["24.30", "45.47"],
      groupX: 50,
      groupY: 200,
      shapes: [
        // Main room (highlighted in teal)
        { x: 60, y: 80, w: 160, h: 200, label: "С/У", fill: "#7DD3C0" },
        // Kitchen area
        { x: 0, y: 0, w: 80, h: 60, label: "кухня" },
        // Bathroom
        { x: 0, y: 60, w: 60, h: 80, label: "С/У" },
        // Entry area
        { x: 0, y: 140, w: 60, h: 40, label: "" },
        // Corridor
        { x: 60, y: 0, w: 40, h: 80, label: "" },
        // Another room section
        { x: 100, y: 0, w: 120, h: 80, label: "" },
        // Side sections
        { x: 220, y: 80, w: 40, h: 120, label: "" },
        { x: 220, y: 200, w: 40, h: 80, label: "" },
      ],
      highlightColor: "#7DD3C0",
    },

    // Center-left apartment
    {
      id: "apt-center-left", 
      number: 2,
      info: ["24.30", "44.73"],
      groupX: 310,
      groupY: 200,
      shapes: [
        // Main living area
        { x: 0, y: 80, w: 120, h: 120, label: "С/У" },
        // Kitchen
        { x: 0, y: 0, w: 60, h: 80, label: "кухня" },
        // Bathroom
        { x: 60, y: 0, w: 60, h: 80, label: "С/У" },
        // Entry corridor
        { x: 0, y: 200, w: 120, h: 40, label: "" },
        // Balcony area
        { x: 0, y: 240, w: 120, h: 40, label: "" },
      ],
      highlightColor: "#FFFFFF",
    },

    // Center-right apartment  
    {
      id: "apt-center-right",
      number: 2, 
      info: ["24.30", "45.47"],
      groupX: 460,
      groupY: 200,
      shapes: [
        // Main living area
        { x: 0, y: 80, w: 120, h: 120, label: "С/У" },
        // Kitchen
        { x: 0, y: 0, w: 60, h: 80, label: "кухня" },
        // Bathroom
        { x: 60, y: 0, w: 60, h: 80, label: "С/У" },
        // Entry corridor
        { x: 0, y: 200, w: 120, h: 40, label: "" },
        // Balcony area
        { x: 0, y: 240, w: 120, h: 40, label: "" },
      ],
      highlightColor: "#FFFFFF",
    },

    // Right apartment - 3 room
    {
      id: "apt-right",
      number: 3,
      info: ["45.18", "69.33"], 
      groupX: 610,
      groupY: 200,
      shapes: [
        // Main room
        { x: 0, y: 80, w: 100, h: 120, label: "С/У" },
        // Kitchen area
        { x: 0, y: 0, w: 50, h: 80, label: "кухня" },
        // Bathroom
        { x: 50, y: 0, w: 50, h: 80, label: "С/У" },
        // Second room
        { x: 100, y: 0, w: 80, h: 120, label: "" },
        // Third room 
        { x: 100, y: 120, w: 80, h: 80, label: "" },
        // Entry area
        { x: 0, y: 200, w: 100, h: 40, label: "" },
        // Balcony
        { x: 100, y: 200, w: 80, h: 40, label: "" },
        // Side corridor
        { x: 0, y: 240, w: 180, h: 40, label: "" },
      ],
      highlightColor: "#FFFFFF", 
    },
  ];

  // zoom
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onWheel = (e: any) => {
      e.evt.preventDefault();
      const scaleBy = 1.02;

      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale =
        direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

      setScale(newScale);

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };

      setPos(newPos);
    };

    stage.on("wheel", onWheel);
    return () => stage.off("wheel", onWheel);
  }, []);

  // drag movement
  const handleDragEnd = (e: any) => {
    setPos({ x: e.target.x(), y: e.target.y() });
  };

  // Apartment renderer
  function renderApartment(apt: Apartment) {
    const isSelected = selectedApt === apt.id;

    return (
      <Group
        key={apt.id}
        x={apt.groupX}
        y={apt.groupY}
        onClick={() => {
          setSelectedApt(apt.id);
          setModal({ open: true, apt });
        }}
        onTap={() => {
          setSelectedApt(apt.id);
          setModal({ open: true, apt });
        }}
        onMouseEnter={(e: any) =>
          (e.target.getStage()?.container()?.style && (e.target.getStage().container().style.cursor = "pointer"))
        }
        onMouseLeave={(e: any) =>
          (e.target.getStage()?.container()?.style && (e.target.getStage().container().style.cursor = "default"))
        }
      >
        {apt.shapes.map((s: ApartmentShape, i: number) => (
          <Group key={i}>
            <Rect
              x={s.x}
              y={s.y}
              width={s.w}
              height={s.h}
              fill={s.fill || (isSelected ? apt.highlightColor : "#FFFFFF")}
              stroke="#777"
              strokeWidth={1}
            />
            {s.label && (
              <Text 
                x={s.x + 8} 
                y={s.y + 8} 
                text={s.label} 
                fontSize={10}
                fill="#333"
              />
            )}
          </Group>
        ))}

        {/* Apartment number and info */}
        <Group>
          <Rect
            x={5}
            y={5}
            width={40}
            height={40}
            fill="#FFA726"
            cornerRadius={20}
          />
          <Text 
            x={18} 
            y={18} 
            text={`${apt.number}`} 
            fontSize={16} 
            fontStyle="bold"
            fill="white"
          />
        </Group>
        
        <Text
          x={8}
          y={50}
          text={`${apt.info[0]}`}
          fontSize={10}
          fontStyle="bold"
        />
        <Text
          x={8}
          y={62}
          text={`${apt.info[1]}`}
          fontSize={10}
        />
      </Group>
    );
  }

  return (
    <div style={{ width: "100%", display: "flex", gap: 20 }}>
      {/* Left Controls */}
      <div style={{ minWidth: 220 }}>
        <div
          style={{
            background: "#fff3cd",
            borderRadius: 50,
            width: 80,
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{entrance}</div>
            <div style={{ fontSize: 12 }}>подъезд</div>
          </div>
        </div>

        <div
          style={{
            background: "#fff3cd",
            borderRadius: 50,
            width: 80,
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{floor}</div>
            <div style={{ fontSize: 12 }}>этаж</div>
          </div>
        </div>

        {/* Dropdowns */}
        <div style={{ marginTop: 20 }}>
          <label>Choose floor</label>
          <select
            value={floor}
            onChange={(e) => setFloor(Number(e.target.value))}
            style={{ width: "100%", padding: 8 }}
          >
            <option>7</option>
            <option>6</option>
            <option>5</option>
          </select>
        </div>

        <div style={{ marginTop: 12 }}>
          <label>Choose entrance</label>
          <select
            value={entrance}
            onChange={(e) => setEntrance(Number(e.target.value))}
            style={{ width: "100%", padding: 8 }}
          >
            <option>8</option>
            <option>7</option>
            <option>6</option>
          </select>
        </div>

        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => {
              setScale(1);
              setPos({ x: 0, y: 0 });
            }}
            style={{ padding: "8px 12px" }}
          >
            Reset view
          </button>
        </div>

        <div style={{ marginTop: 20 }}>
          <b>Selected:</b>
          <div>{selectedApt || "—"}</div>
        </div>
      </div>

      {/* Canvas */}
      <div
        style={{
          flex: 1,
          border: "1px solid #eee",
          background: "#fff",
          position: "relative",
        }}
      >
        <Stage
          ref={stageRef}
          width={1000}
          height={600}
          scaleX={scale}
          scaleY={scale}
          x={pos.x}
          y={pos.y}
          draggable
          onDragEnd={handleDragEnd}
        >
          <Layer ref={layerRef}>
            {/* Main building outline */}
            <Rect x={20} y={50} width={840} height={480} stroke="#333" strokeWidth={2} fill="#F8F8F8" />
            
            {/* Compass */}
            <Group x={30} y={20}>
              <Text text="N" fontSize={14} fontStyle="bold" />
              <Line points={[8, 5, 8, 25]} stroke="#E91E63" strokeWidth={3} />
              <Line points={[8, 25, 5, 20]} stroke="#E91E63" strokeWidth={2} />
              <Line points={[8, 25, 11, 20]} stroke="#E91E63" strokeWidth={2} />
              <Text text="S" fontSize={12} x={5} y={28} fill="#666" />
            </Group>

            {/* Central staircase and elevator */}
            <Group x={400} y={150}>
              {/* Elevator shaft */}
              <Rect x={0} y={0} width={60} height={80} fill="#E0E0E0" stroke="#666" strokeWidth={1} />
              <Text x={20} y={25} text="Лифт" fontSize={10} />
              
              {/* Staircase */}
              <Rect x={0} y={90} width={60} height={120} fill="#F0F0F0" stroke="#666" strokeWidth={1} />
              <Text x={15} y={135} text="Лестн." fontSize={10} />
              
              {/* Stair steps visualization */}
              {[0,1,2,3,4,5,6,7].map((step) => (
                <Line 
                  key={step}
                  points={[5, 95 + step * 12, 55, 95 + step * 12]} 
                  stroke="#CCC" 
                  strokeWidth={1}
                />
              ))}
              
              {/* Technical rooms */}
              <Rect x={0} y={220} width={30} height={40} fill="#DDD" stroke="#666" strokeWidth={1} />
              <Text x={5} y={235} text="Т.п" fontSize={8} />
              
              <Rect x={30} y={220} width={30} height={40} fill="#DDD" stroke="#666" strokeWidth={1} />
              <Text x={38} y={235} text="Эл." fontSize={8} />
            </Group>

            {/* Render all apartments */}
            {apartments.map((a) => renderApartment(a))}

            {/* Building entrance markers */}
            <Group x={430} y={530}>
              <Rect x={-20} y={0} width={40} height={20} fill="#4CAF50" stroke="#2E7D32" strokeWidth={1} />
              <Text x={-15} y={8} text="Вход" fontSize={10} fill="white" fontStyle="bold" />
            </Group>

            {/* Dimension lines and measurements */}
            <Group opacity={0.6}>
              {/* Horizontal dimension lines */}
              <Line points={[50, 40, 850, 40]} stroke="#999" strokeWidth={1} />
              <Line points={[50, 35, 50, 45]} stroke="#999" strokeWidth={1} />
              <Line points={[850, 35, 850, 45]} stroke="#999" strokeWidth={1} />
              <Text x={420} y={25} text="800" fontSize={10} fill="#666" />
              
              {/* Vertical dimension lines */}
              <Line points={[10, 60, 10, 520]} stroke="#999" strokeWidth={1} />
              <Line points={[5, 60, 15, 60]} stroke="#999" strokeWidth={1} />
              <Line points={[5, 520, 15, 520]} stroke="#999" strokeWidth={1} />
              <Text x={-5} y={290} text="460" fontSize={10} fill="#666" rotation={-90} />
            </Group>

          </Layer>
        </Stage>

        {/* Modal */}
        {modal.open && modal.apt && (
          <div
            style={{
              position: "absolute",
              right: 20,
              top: 20,
              background: "white",
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 6,
              width: 220,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>Квартира {modal.apt.number}</strong>
              <button 
                onClick={() => setModal({ open: false, apt: null })}
                style={{ 
                  border: "none", 
                  background: "none", 
                  fontSize: "18px",
                  cursor: "pointer"
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: "12px", color: "#666" }}>Площадь:</div>
              <div style={{ fontWeight: "bold" }}>{modal.apt.info[0]} м²</div>
              
              <div style={{ fontSize: "12px", color: "#666", marginTop: 4 }}>Общая площадь:</div>
              <div style={{ fontWeight: "bold" }}>{modal.apt.info[1]} м²</div>

              <div style={{ marginTop: 12, display: "flex", gap: "8px" }}>
                <button
                  style={{ 
                    padding: "8px 12px",
                    backgroundColor: "#FFA726",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                  onClick={() => alert("Показать детали квартиры")}
                >
                  Подробнее
                </button>
                <button
                  style={{ 
                    padding: "8px 12px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                  onClick={() => alert("Забронировать квартиру")}
                >
                  Бронь
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
