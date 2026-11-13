export interface ColDef {
  key: string;
  label: string;
  defaultVisible: boolean;
  filterable: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  iconName: string;
  badge?: string;
  description?: string;
}

// ── 載具清單欄位定義（已移除班級、車格位置） ──────────────────────────
export const tabletColumns: ColDef[] = [
  { key: "設備ID",       label: "設備ID",       defaultVisible: true,  filterable: false },
  { key: "設備類型",     label: "設備類型",     defaultVisible: false, filterable: true  },
  { key: "品牌",         label: "品牌",         defaultVisible: false, filterable: true  },
  { key: "型號",         label: "型號",         defaultVisible: true,  filterable: true  },
  { key: "作業系統",     label: "作業系統",     defaultVisible: true,  filterable: true  },
  { key: "配備",         label: "配備",         defaultVisible: false, filterable: true  },
  { key: "設備編號",     label: "設備編號",     defaultVisible: false, filterable: false },
  { key: "設備序號",     label: "設備序號",     defaultVisible: false, filterable: false },
  { key: "MAC位址",      label: "MAC位址",      defaultVisible: false, filterable: false },
  { key: "平板車ID",     label: "平板車ID",     defaultVisible: true,  filterable: true  },
  { key: "入校年度",     label: "入校年度",     defaultVisible: false, filterable: true  },
  { key: "購買日期",     label: "購買日期",     defaultVisible: false, filterable: false },
  { key: "保固到期日",   label: "保固到期日",   defaultVisible: false, filterable: false },
  { key: "設備狀態",     label: "設備狀態",     defaultVisible: true,  filterable: true  },
  { key: "相關計畫",     label: "相關計畫",     defaultVisible: true,  filterable: true  },
  { key: "最後盤點日期", label: "最後盤點日期", defaultVisible: false, filterable: true  },
  { key: "備註",         label: "備註",         defaultVisible: true,  filterable: false },
];

// ── 平板車清單欄位定義（載具數量排在設備容量前，支援篩選） ──────────────
export const cartColumns: ColDef[] = [
  { key: "平板車ID編號", label: "平板車ID",   defaultVisible: true,  filterable: false },
  { key: "鑰匙編號",     label: "鑰匙編號",   defaultVisible: true,  filterable: false },
  { key: "載具數量",     label: "載具數量",   defaultVisible: true,  filterable: true  },
  { key: "設備容量",     label: "設備容量",   defaultVisible: true,  filterable: true  },
  { key: "所在班級",     label: "所在班級",   defaultVisible: true,  filterable: true  },
  { key: "放置位置",     label: "放置位置",   defaultVisible: true,  filterable: true  },
  { key: "管理者",       label: "管理者",     defaultVisible: true,  filterable: true  },
  { key: "狀態",         label: "狀態",       defaultVisible: true,  filterable: true  },
  { key: "入校年度",     label: "入校年度",   defaultVisible: false, filterable: true  },
  { key: "相關計畫",     label: "相關計畫",   defaultVisible: true,  filterable: true  },
  { key: "過保年限",     label: "過保年限",   defaultVisible: false, filterable: false },
  { key: "使用年限",     label: "使用年限",   defaultVisible: false, filterable: false },
  { key: "備註",         label: "備註",       defaultVisible: false, filterable: false },
];

// ── 左側選單配置（未來新增第5格、第6格只需在此陣列加項目） ─────────────
export const MENU_ITEMS: MenuItem[] = [
  { id: "dashboard",  label: "Dashboard",  iconName: "LayoutDashboard", description: "統計總資料" },
  { id: "tablets",    label: "平板資料",    iconName: "Tablet",          description: "載具清單與篩選" },
  { id: "carts",      label: "平板車資料",  iconName: "Bus",             description: "車載配置與狀態" },
  { id: "classrooms", label: "教室資料",    iconName: "School",          badge: "規劃中", description: "班級空間配置" },
  // { id: "ext5",    label: "第五格功能",  iconName: "Layers",          badge: "預留" },
  // { id: "ext6",    label: "第六格功能",  iconName: "Layers",          badge: "預留" },
];
