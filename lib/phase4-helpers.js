export function canCreateVendorPo(role) {
  return role === 'PURCHASING' || role === 'ADMIN';
}

export function canCreateGoodsReceipt(role) {
  return role === 'GA' || role === 'ADMIN';
}

export function computeReceivedSoFar(item, currentItems) {
  return Number(item?.qtyReceived ?? 0);
}

export function remainingToReceive(item) {
  return Math.max(0, Number(item.qtyOrdered ?? 0) - Number(item.qtyReceived ?? 0));
}

export function remainingToReceiveForPoLine(poItem, soItem) {
  return Math.max(0, Number(poItem.qty ?? 0) - Number(soItem?.qtyReceived ?? 0));
}
