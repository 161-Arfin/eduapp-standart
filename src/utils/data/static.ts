export const phoneRegExp =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;
export const usernameRegExp = /^[a-zA-Z0-9]+$/;
export const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

export const menuFeatureItem = [
  {
    id: 1,
    menuName: "Arsip",
    menuController: "arsip",
    menuFunction: "",
    menuIcon: "GoArchive",
    dataTarget: "collapseArsip",
    isActive: true,
    orderNo: 1,
    submenu: [
      {
        id: 1,
        submenuName: "Tambah Arsip",
        submenuFunction: "create",
        orderNo: 1,
      },
      {
        id: 2,
        submenuName: "Data Arsip",
        submenuFunction: "",
        orderNo: 2,
      },
      {
        id: 3,
        submenuName: "Recycle Bin",
        submenuFunction: "recyclebin",
        orderNo: 3,
      },
    ],
  },
];

export const menuSettingItem = [
  {
    id: 1,
    menuName: "User Management",
    menuController: "user",
    menuFunction: "#",
    menuIcon: "FiUsers",
    dataTarget: "collapseUser",
    isActive: true,
    orderNo: 1,
    submenu: [
      {
        id: 1,
        submenuName: "Tambah User",
        submenuFunction: "create",
        orderNo: 1,
      },
      {
        id: 2,
        submenuName: "Data User",
        submenuFunction: "",
        orderNo: 2,
      },
      {
        id: 3,
        submenuName: "Recycle Bin",
        submenuFunction: "recyclebin",
        orderNo: 3,
      },
    ],
  },
  {
    id: 2,
    menuName: "Edit Profile",
    menuController: "update-profile",
    menuFunction: "",
    menuIcon: "TbUserEdit",
    dataTarget: "collapseUpdateProfile",
    isActive: true,
    orderNo: 2,
    submenu: [],
  },
  {
    id: 3,
    menuName: "Ubah Password",
    menuController: "auth",
    menuFunction: "change-password",
    menuIcon: "MdOutlineLockPerson",
    dataTarget: "collapseChangePassword",
    isActive: true,
    orderNo: 3,
    submenu: [],
  },
];

export const counterDataDashboard = [
  {
    id: 1,
    title: "Pengiriman Paket",
    icon: "sendingBox",
    value: 297,
  },
  {
    id: 2,
    title: "Penerimaan Paket",
    icon: "receivingBox",
    value: 136,
  },
  {
    id: 3,
    title: "Agent",
    icon: "agent",
    value: 97,
  },
  {
    id: 4,
    title: "Cabang",
    icon: "unit",
    value: 37,
  },
];

export const genderOption = [
  {
    id: 0,
    name: "- Pilih Jenis Kelamin -",
  },
  {
    id: 1,
    name: "Laki - laki",
  },
  {
    id: 2,
    name: "Perempuan",
  },
];

export const usertypeOption = [
  {
    id: "1",
    name: "Master Admin",
  },
  {
    id: "2",
    name: "Super Admin",
  },
  {
    id: "3",
    name: "Administrator",
  },
  {
    id: "4",
    name: "Pegawai",
  },
  {
    id: "5",
    name: "Grand Admin",
  },
];

export const dashboardCounter = [
  {
    id: 1,
    counter: [
      {
        id: 1,
        title: "Arsip",
        dataKey: "arsip",
        icon: "FiArchive",
        value: 0,
        width: "lg:w-1/3 md:w-1/2",
      },
      {
        id: 2,
        title: "Arsip Aktif",
        dataKey: "arsip_active",
        icon: "FiCheckCircle",
        value: 0,
        width: "lg:w-1/3 md:w-1/2",
      },
      {
        id: 3,
        title: "Arsip Inaktif",
        dataKey: "arsip_inactive",
        icon: "FiXCircle",
        value: 0,
        width: "lg:w-1/3",
      },
    ],
  },
  // {
  //   id: 2,
  //   counter: [
  //     {
  //       id: 1,
  //       title: "Rak",
  //       icon: "TbBuilding",
  //       value: 0,
  //       width: "lg:w-1/4 md:w-1/2",
  //     },
  //     {
  //       id: 2,
  //       title: "Baris",
  //       icon: "database",
  //       value: 0,
  //       width: "lg:w-1/4 md:w-1/2",
  //     },
  //     {
  //       id: 3,
  //       title: "Box",
  //       icon: "GoInbox",
  //       value: 0,
  //       width: "lg:w-1/4 md:w-1/2",
  //     },
  //     {
  //       id: 4,
  //       title: "Map",
  //       icon: "LuNotebookText",
  //       value: 0,
  //       width: "lg:w-1/4 md:w-1/2",
  //     },
  //   ],
  // },
  // {
  //   id: 3,
  //   counter: [
  //     {
  //       id: 1,
  //       title: "Menu",
  //       icon: "TfiMenuAlt",
  //       value: 0,
  //       width: "lg:w-1/4 md:w-1/2",
  //     },
  //     {
  //       id: 2,
  //       title: "SubMenu",
  //       icon: "TfiMenuAlt",
  //       value: 0,
  //       width: "lg:w-1/4 md:w-1/2",
  //     },
  //     {
  //       id: 3,
  //       title: "User",
  //       icon: "FiUsers",
  //       value: 0,
  //       width: "lg:w-1/4 md:w-1/2",
  //     },
  //     {
  //       id: 4,
  //       title: "Level User",
  //       icon: "TbUserShield",
  //       value: 0,
  //       width: "lg:w-1/4 md:w-1/2",
  //     },
  //   ],
  // },
];

export const statusAksesOptions = [
  {
    id: 1,
    label: "Private",
  },
  {
    id: 2,
    label: "Publis",
  },
];

export const keteranganOptions = [
  {
    id: 1,
    label: "Permanen",
  },
  {
    id: 2,
    label: "Musnah",
  },
];
