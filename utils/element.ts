export type Vector2 = [number, number];

export function calcMoveDistance(el: HTMLElement): Vector2 {
  const { clientCenterPoint } = getClientInfo();
  const { eleCenterPoint } = getEleInfo(el);

  const moveX = clientCenterPoint[0] - eleCenterPoint[0];
  const moveY = clientCenterPoint[1] - eleCenterPoint[1];

  return [moveX, moveY];
}

export function getEleInfo(el: HTMLElement) {
  const eleW = el.clientWidth;
  const eleH = el.clientHeight;

  const eleCenterPoint: Vector2 = [eleW / 2, eleH / 2];

  return {
    eleW,
    eleH,
    eleCenterPoint,
  };
}

export function getClientInfo() {
  const clientW = document.documentElement.clientWidth;
  const clientH = document.documentElement.clientHeight;

  const clientCenterPoint: Vector2 = [clientW / 2, clientH / 2];

  return {
    clientW,
    clientH,
    clientCenterPoint,
  };
}
