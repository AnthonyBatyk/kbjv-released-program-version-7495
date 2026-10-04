document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const AUTH_API_URL = "https://kbjv-auth-api.anthonybatyk.workers.dev";
  const AUTH_LOCAL_KEY = "kbjv_auth_session";
  const AUTH_SESSION_KEY = "kbjv_auth_session_temp";
  const LEGACY_STORAGE_KEYS = {
    PRODUCTS_KEY:"kbjv_products", CALCULATOR_KEY:"kbjv_calculator", ARCHIVE_KEY:"kbjv_archive", ACTIVE_TAB_KEY:"kbjv_active_tab",
    CALCULATOR_DRAFT_KEY:"kbjv_calculator_draft", SORT_KEY:"kbjv_product_sort", SORT_SCHEMA_KEY:"kbjv_product_sort_v26",
    RANDOM_SORT_SEED_KEY:"kbjv_product_random_seed", CATEGORY_ORDER_KEY:"kbjv_category_order", CONSOLE_KEY:"kbjv_console",
    EXPORT_VERSION_KEY:"kbjv_export_version", DATABASE_UPDATED_KEY:"kbjv_database_updated_at", EXPORT_FINGERPRINT_KEY:"kbjv_export_fingerprint",
    DAILY_GOAL_KEY:"kbjv_daily_goal", LAST_EXPORT_KEY:"kbjv_last_export_at", LAST_IMPORT_KEY:"kbjv_last_import_at", UNDO_KEY:"kbjv_undo_snapshot",
    STATS_TO_TODAY_KEY:"kbjv_stats_to_today", MEDICINES_KEY:"kbjv_medicines", MEDICINE_ARCHIVE_KEY:"kbjv_medicine_archive", MEDICINE_BUY_KEY:"kbjv_medicine_buy"
  };

  let PRODUCTS_KEY=LEGACY_STORAGE_KEYS.PRODUCTS_KEY, CALCULATOR_KEY=LEGACY_STORAGE_KEYS.CALCULATOR_KEY, ARCHIVE_KEY=LEGACY_STORAGE_KEYS.ARCHIVE_KEY;
  let ACTIVE_TAB_KEY=LEGACY_STORAGE_KEYS.ACTIVE_TAB_KEY, CALCULATOR_DRAFT_KEY=LEGACY_STORAGE_KEYS.CALCULATOR_DRAFT_KEY, SORT_KEY=LEGACY_STORAGE_KEYS.SORT_KEY;
  let SORT_SCHEMA_KEY=LEGACY_STORAGE_KEYS.SORT_SCHEMA_KEY, RANDOM_SORT_SEED_KEY=LEGACY_STORAGE_KEYS.RANDOM_SORT_SEED_KEY, CATEGORY_ORDER_KEY=LEGACY_STORAGE_KEYS.CATEGORY_ORDER_KEY;
  let CONSOLE_KEY=LEGACY_STORAGE_KEYS.CONSOLE_KEY, EXPORT_VERSION_KEY=LEGACY_STORAGE_KEYS.EXPORT_VERSION_KEY, DATABASE_UPDATED_KEY=LEGACY_STORAGE_KEYS.DATABASE_UPDATED_KEY;
  let EXPORT_FINGERPRINT_KEY=LEGACY_STORAGE_KEYS.EXPORT_FINGERPRINT_KEY, DAILY_GOAL_KEY=LEGACY_STORAGE_KEYS.DAILY_GOAL_KEY, LAST_EXPORT_KEY=LEGACY_STORAGE_KEYS.LAST_EXPORT_KEY;
  let LAST_IMPORT_KEY=LEGACY_STORAGE_KEYS.LAST_IMPORT_KEY, UNDO_KEY=LEGACY_STORAGE_KEYS.UNDO_KEY, STATS_TO_TODAY_KEY=LEGACY_STORAGE_KEYS.STATS_TO_TODAY_KEY;
  let MEDICINES_KEY=LEGACY_STORAGE_KEYS.MEDICINES_KEY, MEDICINE_ARCHIVE_KEY=LEGACY_STORAGE_KEYS.MEDICINE_ARCHIVE_KEY, MEDICINE_BUY_KEY=LEGACY_STORAGE_KEYS.MEDICINE_BUY_KEY;
  let PROFILE_KEY="kbjv_profile", CUSTOM_CATEGORIES_KEY="kbjv_custom_categories", DELETED_DEFAULT_CATEGORIES_KEY="kbjv_deleted_default_categories", DEPARTMENTS_ENABLED_KEY="kbjv_departments_enabled", CALC_QUICK_PRESETS_KEY="kbjv_calc_quick_presets", AUDIT_QUEUE_KEY="kbjv_audit_queue";

  let authUser=null, authToken="", authRemembered=false, appInitialized=false;

  function applyUserStorageNamespace(userId){
    const prefix=`kbjv_user_${String(userId)}_`;
    PRODUCTS_KEY=prefix+"products"; CALCULATOR_KEY=prefix+"calculator"; ARCHIVE_KEY=prefix+"archive"; ACTIVE_TAB_KEY=prefix+"active_tab";
    CALCULATOR_DRAFT_KEY=prefix+"calculator_draft"; SORT_KEY=prefix+"product_sort"; SORT_SCHEMA_KEY=prefix+"product_sort_v26";
    RANDOM_SORT_SEED_KEY=prefix+"product_random_seed"; CATEGORY_ORDER_KEY=prefix+"category_order"; CONSOLE_KEY=prefix+"console";
    EXPORT_VERSION_KEY=prefix+"export_version"; DATABASE_UPDATED_KEY=prefix+"database_updated_at"; EXPORT_FINGERPRINT_KEY=prefix+"export_fingerprint";
    DAILY_GOAL_KEY=prefix+"daily_goal"; LAST_EXPORT_KEY=prefix+"last_export_at"; LAST_IMPORT_KEY=prefix+"last_import_at"; UNDO_KEY=prefix+"undo_snapshot";
    STATS_TO_TODAY_KEY=prefix+"stats_to_today"; MEDICINES_KEY=prefix+"medicines"; MEDICINE_ARCHIVE_KEY=prefix+"medicine_archive"; MEDICINE_BUY_KEY=prefix+"medicine_buy";
    PROFILE_KEY=prefix+"profile"; CUSTOM_CATEGORIES_KEY=prefix+"custom_categories"; DELETED_DEFAULT_CATEGORIES_KEY=prefix+"deleted_default_categories"; DEPARTMENTS_ENABLED_KEY=prefix+"departments_enabled"; CALC_QUICK_PRESETS_KEY=prefix+"calc_quick_presets"; AUDIT_QUEUE_KEY=prefix+"audit_queue";
  }

  function migrateLegacyDataToAdmin(user){
    if(!user||user.role!=="admin")return;
    const marker=`kbjv_legacy_migrated_v47_${user.id}`;
    if(localStorage.getItem(marker)==="1")return;
    const pairs=[
      [LEGACY_STORAGE_KEYS.PRODUCTS_KEY,PRODUCTS_KEY],[LEGACY_STORAGE_KEYS.CALCULATOR_KEY,CALCULATOR_KEY],[LEGACY_STORAGE_KEYS.ARCHIVE_KEY,ARCHIVE_KEY],
      [LEGACY_STORAGE_KEYS.ACTIVE_TAB_KEY,ACTIVE_TAB_KEY],[LEGACY_STORAGE_KEYS.CALCULATOR_DRAFT_KEY,CALCULATOR_DRAFT_KEY],[LEGACY_STORAGE_KEYS.SORT_KEY,SORT_KEY],
      [LEGACY_STORAGE_KEYS.SORT_SCHEMA_KEY,SORT_SCHEMA_KEY],[LEGACY_STORAGE_KEYS.RANDOM_SORT_SEED_KEY,RANDOM_SORT_SEED_KEY],[LEGACY_STORAGE_KEYS.CATEGORY_ORDER_KEY,CATEGORY_ORDER_KEY],
      [LEGACY_STORAGE_KEYS.CONSOLE_KEY,CONSOLE_KEY],[LEGACY_STORAGE_KEYS.EXPORT_VERSION_KEY,EXPORT_VERSION_KEY],[LEGACY_STORAGE_KEYS.DATABASE_UPDATED_KEY,DATABASE_UPDATED_KEY],
      [LEGACY_STORAGE_KEYS.EXPORT_FINGERPRINT_KEY,EXPORT_FINGERPRINT_KEY],[LEGACY_STORAGE_KEYS.DAILY_GOAL_KEY,DAILY_GOAL_KEY],[LEGACY_STORAGE_KEYS.LAST_EXPORT_KEY,LAST_EXPORT_KEY],
      [LEGACY_STORAGE_KEYS.LAST_IMPORT_KEY,LAST_IMPORT_KEY],[LEGACY_STORAGE_KEYS.UNDO_KEY,UNDO_KEY],[LEGACY_STORAGE_KEYS.STATS_TO_TODAY_KEY,STATS_TO_TODAY_KEY]
    ];
    pairs.forEach(([legacyKey,userKey])=>{if(localStorage.getItem(userKey)===null){const value=localStorage.getItem(legacyKey);if(value!==null)localStorage.setItem(userKey,value);}});
    localStorage.setItem(marker,"1");
  }

  let products = [];
  let calculatorItems = [];
  let archiveItems = [];
  let selectedProduct = null;
  let editingProduct = null;
  let draggedCard = null;
  let reorderMode = false;
  let reorderChanged = false;
  let pendingProductOrder = null;
  let productOrderOriginal = null;
  let archiveEditingId = null;
  let archiveOriginalText = null;
  let archiveEditingButton = null;
  let archiveCompositionSourceButton = null;
  let archiveCommentEditingId = null;
  let archiveCommentOriginal = "";
  let archiveCommentEditingButton = null;
  let currentSort = "categories";
  const VALID_SORT_MODES=new Set(["categories","oldest","newest","list","random","initial","manual"]);
  let sortTarget = "blocks";
  let pendingCategoryOrder = null;
  let departmentsEnabled = true;
  let profileData = {display_name:"",full_name:"",birth_date:"",weight:"",height:"",avatar:""};
  let calculatorQuickPresets = [];
  let consoleItems = [];
  let draggedCalcIndex = null;
  let calculatorReorderMode = false;
  let calculatorReorderChanged = false;
  let medicines = [];
  let medicineArchive = [];
  let medicineBuy = [];
  let dailyGoal = {enabled:false,kcal:0,protein:0,fat:0,carb:0,sugar:0,salt:0,fiber:0};
  let dailyGoalSettingsOpen = false;
  let pendingExport = null;
  let exportScope = "all";
  let pendingImport = null;
  let importScope = "all";

  const $ = id => document.getElementById(id);
  const tabs = document.querySelectorAll(".tab");
  const pages = document.querySelectorAll(".page");

  const authScreen=$("auth-screen"), mainApp=$("main-app"), authTitle=$("auth-title"), authSubtitle=$("auth-subtitle"), authMessage=$("auth-message");
  const loginForm=$("login-form"), loginUsername=$("login-username"), loginPassword=$("login-password"), loginRemember=$("login-remember"), loginSubmit=$("login-submit"), showRegister=$("show-register");
  const registerForm=$("register-form"), registerUsername=$("register-username"), registerPassword=$("register-password"), registerPasswordConfirm=$("register-password-confirm"), registerAccessCode=$("register-access-code"), registerRemember=$("register-remember"), registerSubmit=$("register-submit"), showLogin=$("show-login");
  const passwordStrengthFill=$("password-strength-fill"), passwordStrengthText=$("password-strength-text"), passwordRuleElements=[...document.querySelectorAll("[data-password-rule]")];
  const adminTab=$("admin-tab"), adminRefresh=$("admin-refresh"), adminCurrentUsername=$("admin-current-username"), adminUsersCount=$("admin-users-count"), adminAdminsCount=$("admin-admins-count"), adminMembersCount=$("admin-members-count"), adminStatus=$("admin-status"), adminUsersList=$("admin-users-list"), adminAuditCount=$("admin-audit-count"), adminAuditStatus=$("admin-audit-status"), adminAuditList=$("admin-audit-list");
  const adminLoginsModal=$("admin-logins-modal"), adminLoginsUser=$("admin-logins-user"), adminLoginsList=$("admin-logins-list"), adminLoginsClose=$("admin-logins-close"), logoutAccount=$("logout-account");
  const profileOpen=$("profile-open"), profileAvatarSmall=$("profile-avatar-small"), profileAvatarInitials=$("profile-avatar-initials"), profileDisplayName=$("profile-display-name");
  const profilePhotoButton=$("profile-photo-button"), profileAvatarLarge=$("profile-avatar-large"), profileAvatarLargeInitials=$("profile-avatar-large-initials"), profilePhotoChange=$("profile-photo-change"), profilePhotoRemove=$("profile-photo-remove"), profilePhotoInput=$("profile-photo-input");
  const profileDisplayInput=$("profile-display-input"), profileDisplayCount=$("profile-display-count"), profileFullName=$("profile-full-name"), profileBirthDate=$("profile-birth-date"), profileWeight=$("profile-weight"), profileHeight=$("profile-height"), profileSave=$("profile-save");
  const grid = $("grid");
  const searchInput = $("search");
  const clearSearch = $("clear-search");
  const exportButton = $("export-products");
  const importButton = $("import-products");
  const importFile = $("import-file");
  const addProductButton = $("add-product");
  const deleteProductButton = $("delete-product");
  const reorderProductsButton = $("reorder-products");
  const sortProductsButton = $("sort-products");

  const productModal = $("product-modal");
  const productModalName = $("product-modal-name");
  const productWeight = $("product-weight");
  const productQuickWeights = $("product-quick-weights");
  const productCancel = $("product-cancel");
  const productCopy = $("product-copy");
  const productCalculator = $("product-calculator");

  const addProductModal = $("add-product-modal");
  const addProductCancel = $("add-product-cancel");
  const addProductSave = $("add-product-save");
  const newProductName = $("new-product-name");
  const newProductKcal = $("new-product-kcal");
  const newProductKcalNoData = $("new-product-kcal-no-data");
  const newProductProtein = $("new-product-protein");
  const newProductProteinNoData = $("new-product-protein-no-data");
  const newProductFat = $("new-product-fat");
  const newProductFatNoData = $("new-product-fat-no-data");
  const newProductCarb = $("new-product-carb");
  const newProductCarbNoData = $("new-product-carb-no-data");
  const newProductSugar = $("new-product-sugar");
  const newProductSugarNoData = $("new-product-sugar-no-data");
  const newProductSalt = $("new-product-salt");
  const newProductSaltNoData = $("new-product-salt-no-data");
  const newProductFiber = $("new-product-fiber");
  const newProductFiberNoData = $("new-product-fiber-no-data");
  const newProductCategory = $("new-product-category");
  const newProductQuickWeights = [...document.querySelectorAll(".new-product-quick-weight")];
  const newProductDescription = $("new-product-description");
  const newProductDescriptionNoData = $("new-product-description-no-data");

  const editProductModal = $("edit-product-modal");
  const editProductCancel = $("edit-product-cancel");
  const editProductSave = $("edit-product-save");
  const editProductName = $("edit-product-name");
  const editProductKcal = $("edit-product-kcal");
  const editProductKcalNoData = $("edit-product-kcal-no-data");
  const editProductProtein = $("edit-product-protein");
  const editProductProteinNoData = $("edit-product-protein-no-data");
  const editProductFat = $("edit-product-fat");
  const editProductFatNoData = $("edit-product-fat-no-data");
  const editProductCarb = $("edit-product-carb");
  const editProductCarbNoData = $("edit-product-carb-no-data");
  const editProductSugar = $("edit-product-sugar");
  const editProductSugarNoData = $("edit-product-sugar-no-data");
  const editProductSalt = $("edit-product-salt");
  const editProductSaltNoData = $("edit-product-salt-no-data");
  const editProductFiber = $("edit-product-fiber");
  const editProductFiberNoData = $("edit-product-fiber-no-data");
  const editProductCategory = $("edit-product-category");
  const editProductQuickWeights = [...document.querySelectorAll(".edit-product-quick-weight")];
  const editProductDescription = $("edit-product-description");
  const editProductDescriptionNoData = $("edit-product-description-no-data");

  const productOrderModal = $("product-order-modal");
  const productOrderList = $("product-order-list");
  const productOrderReset = $("product-order-reset");
  const productOrderCancel = $("product-order-cancel");
  const productOrderSave = $("product-order-save");

  const sortProductsModal = $("sort-products-modal");
  const sortCategories = $("sort-categories");
  const sortDepartmentsToggle = $("sort-departments-toggle");
  const sortCategoryOrder = $("sort-category-order");
  const sortCustomCategory = $("sort-custom-category");
  const sortOldest = $("sort-oldest");
  const sortNewest = $("sort-newest");
  const sortList = $("sort-list");
  const sortRandom = $("sort-random");
  const sortInitial = $("sort-initial");
  const sortProductsCancel = $("sort-products-cancel");
  const categoryOrderModal = $("category-order-modal");
  const categoryOrderList = $("category-order-list");
  const categoryOrderReset = $("category-order-reset");
  const categoryOrderCancel = $("category-order-cancel");
  const categoryOrderSave = $("category-order-save");
  const customCategoryModal = $("custom-category-modal");
  const customCategoryName = $("custom-category-name");
  const customCategoryAdd = $("custom-category-add");
  const customCategoryList = $("custom-category-list");
  const customCategoryClose = $("custom-category-close");

  const deleteProductModal = $("delete-product-modal");
  const deleteProductList = $("delete-product-list");
  const deleteProductCancelTop = $("delete-product-cancel-top");
  const deleteProductCancelBottom = $("delete-product-cancel-bottom");
  const deleteSortProducts = $("delete-sort-products");

  const calcInput = $("calc-input");
  const calcAdd = $("calc-add");
  const calcClearText = $("calc-clear-text");
  const calcClearBlocks = $("calc-clear-blocks");
  const calcSection = $("calc-section");
  const calcQuickPresets = $("calc-quick-presets");
  const calcQuickManage = $("calc-quick-manage");
  const calcQuickModal = $("calc-quick-modal");
  const calcQuickMetric = $("calc-quick-metric");
  const calcQuickValue = $("calc-quick-value");
  const calcQuickAdd = $("calc-quick-add");
  const calcQuickList = $("calc-quick-list");
  const calcQuickClose = $("calc-quick-close");
  const kcalElement = $("kcal");
  const proteinElement = $("protein");
  const fatElement = $("fat");
  const carbElement = $("carb");
  const sugarElement = $("sugar");
  const saltElement = $("salt");
  const fiberElement = $("fiber");
  const copyTotal = $("copy-total");
  const saveArchive = $("save-archive");
  const reorderCalculatorHistory = $("reorder-calculator-history");
  const calcLog = $("calc-log");
  const archiveLog = $("archive-log");
  const siteProductsCount = $("site-products-count");
  const siteArchiveCount = $("site-archive-count");
  const siteDatabaseUpdated = $("site-database-updated");
  const siteCurrentDate = $("site-current-date");
  const siteLastExport = $("site-last-export");
  const siteLastImport = $("site-last-import");
  const dailyGoalToggle = $("daily-goal-toggle");
  const dailyGoalContent = $("daily-goal-content");
  const dailyGoalSettings = $("daily-goal-settings");
  const dailyGoalDetailsToggle = $("daily-goal-details-toggle");
  const dailyGoalCopyRemaining = $("daily-goal-copy-remaining");
  const dailyGoalSave = $("daily-goal-save");
  const goalInputs = {kcal:$("goal-kcal"),protein:$("goal-protein"),fat:$("goal-fat"),carb:$("goal-carb"),sugar:$("goal-sugar"),salt:$("goal-salt"),fiber:$("goal-fiber")};
  const remainElements = {kcal:$("remain-kcal"),protein:$("remain-protein"),fat:$("remain-fat"),carb:$("remain-carb"),sugar:$("remain-sugar"),salt:$("remain-salt"),fiber:$("remain-fiber")};
  const progressElements = {kcal:$("progress-kcal"),protein:$("progress-protein"),fat:$("progress-fat"),carb:$("progress-carb"),sugar:$("progress-sugar"),salt:$("progress-salt"),fiber:$("progress-fiber")};
  const progressLabels = {kcal:$("progress-label-kcal"),protein:$("progress-label-protein"),fat:$("progress-label-fat"),carb:$("progress-label-carb"),sugar:$("progress-label-sugar"),salt:$("progress-label-salt"),fiber:$("progress-label-fiber")};
  const exportPreviewModal = $("export-preview-modal");
  const exportPreviewProducts = $("export-preview-products");
  const exportPreviewArchive = $("export-preview-archive");
  const exportPreviewGoal = $("export-preview-goal");
  const exportPreviewProfile = $("export-preview-profile");
  const exportPreviewVersion = $("export-preview-version");
  const exportPreviewDate = $("export-preview-date");
  const exportPreviewCancel = $("export-preview-cancel");
  const exportPreviewConfirm = $("export-preview-confirm");
  const exportScopeButtons = [...document.querySelectorAll("#export-scope-actions [data-scope]")];
  const importPreviewModal = $("import-preview-modal");
  const importPreviewProducts = $("import-preview-products");
  const importPreviewProductsDiff = $("import-preview-products-diff");
  const importPreviewArchive = $("import-preview-archive");
  const importPreviewArchiveDiff = $("import-preview-archive-diff");
  const importPreviewGoal = $("import-preview-goal");
  const importPreviewProfile = $("import-preview-profile");
  const importPreviewVersion = $("import-preview-version");
  const importPreviewDate = $("import-preview-date");
  const importPreviewCancel = $("import-preview-cancel");
  const importPreviewConfirm = $("import-preview-confirm");
  const importScopeButtons = [...document.querySelectorAll("#import-scope-actions [data-scope]")];
  const clearSiteButton = $("clear-site");
  const deleteAccountButton = $("delete-account");
  const undoLastAction = $("undo-last-action");
  const refreshSiteButton = $("refresh-site");
  const medicineOpenAdd = $("medicine-open-add");
  const medicineClearAll = $("medicine-clear-all");
  const medicineBaseList = $("medicine-base-list");
  const medicineBuyList = $("medicine-buy-list");
  const medicineOpenBuyAdd = $("medicine-open-buy-add");
  const medicineTodaySummary = $("medicine-today-summary");
  const medicineOpenToday = $("medicine-open-today");
  const medicineSelectModal = $("medicine-select-modal");
  const medicineSelectList = $("medicine-select-list");
  const medicineSelectCancel = $("medicine-select-cancel");
  const medicineSaveDay = $("medicine-save-day");
  const medicineHistory = $("medicine-history");
  const medicineAddModal = $("medicine-add-modal");
  const medicineFormName = $("medicine-form-name");
  const medicineFormDose = $("medicine-form-dose");
  const medicineFormFull = $("medicine-form-full");
  const medicineAddCancel = $("medicine-add-cancel");
  const medicineAddSave = $("medicine-add-save");
  const medicineBuyModal = $("medicine-buy-modal");
  const medicineBuyName = $("medicine-buy-name");
  const medicineBuyDose = $("medicine-buy-dose");
  const medicineBuyFull = $("medicine-buy-full");
  const medicineBuyCancel = $("medicine-buy-cancel");
  const medicineBuySave = $("medicine-buy-save");
  const consoleLog = $("console-log");
  const statsChart = $("stats-chart");
  const statsEmpty = $("stats-empty");
  const statsTooltip = $("stats-tooltip");
  const statsMonthSummary = $("stats-month-summary");
  let statsRenderedPoints = [];
  let statsChartGeometry = null;
  const statsFrom = $("stats-from");
  const statsTo = $("stats-to");
  const statsToToday = $("stats-to-today");
  let statsToTodayEnabled = false;
  const statsMetricButtons = document.querySelectorAll(".stats-metric");
  let statsMetric = "kcal";

  const archiveTextModal = $("archive-text-modal");
  const archiveTextInput = $("archive-text-input");
  const archiveTextCancel = $("archive-text-cancel");
  const archiveTextSave = $("archive-text-save");
  const archiveCommentModal = $("archive-comment-modal");
  const archiveCommentInput = $("archive-comment-input");
  const archiveCommentLimit = $("archive-comment-limit");
  const archiveCommentCancel = $("archive-comment-cancel");
  const archiveCommentSave = $("archive-comment-save");
  const archiveCompositionModal = $("archive-composition-modal");
  const archiveCompositionDate = $("archive-composition-date");
  const archiveCompositionList = $("archive-composition-list");
  const archiveCompositionClose = $("archive-composition-close");

  const statusStyle = document.createElement("style");
  statusStyle.textContent = `
    .button-status-success,.button-status-success:hover{background:#22c55e!important;color:#fff!important;box-shadow:0 0 0 1px rgba(34,197,94,.30),0 0 18px rgba(34,197,94,.30)!important}
    .button-status-error,.button-status-error:hover{background:#ef4444!important;color:#fff!important;box-shadow:0 0 0 1px rgba(239,68,68,.30),0 0 18px rgba(239,68,68,.30)!important}
    .button-status-info,.button-status-info:hover{background:#7289da!important;color:#fff!important;box-shadow:0 0 0 1px rgba(114,137,218,.30),0 0 18px rgba(114,137,218,.30)!important}
    .button-status-success::after,.button-status-error::after{display:inline-block;margin-left:7px;font-weight:800;animation:buttonStatusIconIn .36s cubic-bezier(.16,1,.3,1) both}
    .button-status-success::after{content:"✓"}
    .button-status-error::after{content:"✕"}
    .button-status-entering{animation:buttonStatusIn .40s cubic-bezier(.16,1,.3,1) both}
    .button-status-leaving{animation:buttonStatusOut .25s cubic-bezier(.4,0,.2,1) both}
    @keyframes buttonStatusIn{
      0%{transform:scale(.988);filter:brightness(.94);opacity:.96}
      58%{transform:scale(1.006);filter:brightness(1.025);opacity:1}
      100%{transform:scale(1);filter:brightness(1);opacity:1}
    }
    @keyframes buttonStatusOut{
      0%{transform:scale(1);filter:brightness(1);opacity:1}
      100%{transform:scale(.994);filter:brightness(.98);opacity:.97}
    }
    @keyframes buttonStatusIconIn{
      0%{opacity:0;transform:translateX(-3px) scale(.86)}
      100%{opacity:1;transform:translateX(0) scale(1)}
    }
  `;
  document.head.appendChild(statusStyle);


  class AuthApiError extends Error{constructor(status,message){super(message);this.status=status;}}

  function setAuthMessage(message="",type=""){
    if(!authMessage)return;
    authMessage.textContent=message;
    authMessage.className=`auth-message${type?` ${type}`:""}`;
  }

  function switchAuthMode(mode){
    const registering=mode==="register";
    if(loginForm)loginForm.hidden=registering;
    if(registerForm)registerForm.hidden=!registering;
    if(authTitle)authTitle.textContent=registering?"Реєстрація у КБЖВ":"Вхід у КБЖВ";
    if(authSubtitle)authSubtitle.textContent=registering?"Створіть власний акаунт. Код доступу потрібен лише для адміністратора.":"Увійдіть у свій акаунт, щоб продовжити.";
    setAuthMessage("");
  }

  function getStoredAuthSession(){
    const sources=[{storage:localStorage,key:AUTH_LOCAL_KEY,remembered:true},{storage:sessionStorage,key:AUTH_SESSION_KEY,remembered:false}];
    for(const source of sources){
      let raw=null;
      try{raw=JSON.parse(source.storage.getItem(source.key)||"null");}catch(_){source.storage.removeItem(source.key);continue;}
      if(!raw)continue;
      if(!raw.token||!raw.user){source.storage.removeItem(source.key);continue;}
      if(raw.expires_at&&Date.parse(raw.expires_at)<=Date.now()){source.storage.removeItem(source.key);continue;}
      return {...raw,remembered:source.remembered};
    }
    return null;
  }

  function persistAuthSession(session,remembered){
    const payload=JSON.stringify({token:session.token,expires_at:session.expires_at,user:session.user});
    if(remembered){localStorage.setItem(AUTH_LOCAL_KEY,payload);sessionStorage.removeItem(AUTH_SESSION_KEY);}
    else{sessionStorage.setItem(AUTH_SESSION_KEY,payload);localStorage.removeItem(AUTH_LOCAL_KEY);}
  }

  function updateStoredAuthUser(user){
    const storage=authRemembered?localStorage:sessionStorage, key=authRemembered?AUTH_LOCAL_KEY:AUTH_SESSION_KEY;
    try{const raw=JSON.parse(storage.getItem(key)||"null");if(raw&&raw.token){raw.user=user;storage.setItem(key,JSON.stringify(raw));}}catch(_){}
  }

  function clearAuthSession(){
    localStorage.removeItem(AUTH_LOCAL_KEY);sessionStorage.removeItem(AUTH_SESSION_KEY);authToken="";authUser=null;authRemembered=false;
  }

  async function authApi(path,{method="GET",body,token=authToken}={}){
    const headers={};
    if(body!==undefined)headers["Content-Type"]="application/json";
    if(token)headers.Authorization=`Bearer ${token}`;
    let response;
    try{response=await fetch(`${AUTH_API_URL}${path}`,{method,headers,body:body===undefined?undefined:JSON.stringify(body),cache:"no-store"});}
    catch(error){const networkError=new AuthApiError(0,"Немає з’єднання із сервером.");networkError.cause=error;throw networkError;}
    let data={};try{data=await response.json();}catch(_){}
    if(!response.ok)throw new AuthApiError(response.status,data?.error||`Помилка сервера (${response.status}).`);
    return data;
  }

  function passwordRules(value){
    const password=String(value||"");
    return {length:password.length>=11,upper:/\p{Lu}/u.test(password),lower:/\p{Ll}/u.test(password),number:/\p{N}/u.test(password),special:/[\p{P}\p{S}]/u.test(password)};
  }

  function renderPasswordStrength(){
    if(!registerPassword)return;
    const value=registerPassword.value,rules=passwordRules(value),score=Object.values(rules).filter(Boolean).length;
    passwordRuleElements.forEach(element=>element.classList.toggle("valid",!!rules[element.dataset.passwordRule]));
    if(!value){passwordStrengthFill.style.width="0";passwordStrengthFill.style.backgroundColor="";passwordStrengthText.textContent="Пароль ще не введено";return;}
    passwordStrengthFill.style.width=`${Math.max(12,score*20)}%`;
    if(score<=2){passwordStrengthFill.style.backgroundColor="#ef4444";passwordStrengthText.textContent="Слабкий пароль";}
    else if(score<5){passwordStrengthFill.style.backgroundColor="#f59e0b";passwordStrengthText.textContent="Середній пароль";}
    else{passwordStrengthFill.style.backgroundColor="#22c55e";passwordStrengthText.textContent="Надійний пароль";}
  }

  function validateRegistrationPassword(password){
    const rules=passwordRules(password);
    if(!rules.length)return "Пароль повинен містити мінімум 11 символів.";
    if(!rules.upper)return "Додайте хоча б одну велику літеру.";
    if(!rules.lower)return "Додайте хоча б одну малу літеру.";
    if(!rules.number)return "Додайте хоча б одну цифру.";
    if(!rules.special)return "Додайте хоча б один спеціальний символ.";
    return "";
  }

  function formatAdminDate(value){
    if(!value)return "—";const date=new Date(value);if(Number.isNaN(date.getTime()))return String(value);
    return date.toLocaleString("uk-UA",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit"});
  }

  function normalizeProfile(value){
    const source=value&&typeof value==="object"?value:{};
    return {
      display_name:String(source.display_name||"").trim().slice(0,20),
      full_name:String(source.full_name||"").trim().slice(0,120),
      birth_date:String(source.birth_date||"").trim().slice(0,10),
      weight:String(source.weight??"").trim().slice(0,20),
      height:String(source.height??"").trim().slice(0,20),
      avatar:String(source.avatar||"").startsWith("data:image/")?String(source.avatar):""
    };
  }
  function hasProfileData(value=profileData){
    const p=normalizeProfile(value);
    return Boolean(p.display_name||p.full_name||p.birth_date||p.weight||p.height||p.avatar);
  }

  const QUICK_METRICS=new Set(["kcal","protein","fat","carb","sugar","salt","fiber"]);
  const QUICK_METRIC_LABELS={
    kcal:"ккал",
    protein:"білка",
    fat:"жирів",
    carb:"вуглеводів",
    sugar:"цукрів",
    salt:"солі",
    fiber:"клітковини"
  };
  function normalizeQuickPreset(value,index=0){
    if(!value||typeof value!=="object")return null;
    const metric=String(value.metric||"").trim();
    const amount=calculatorNumber(value.amount);
    if(!QUICK_METRICS.has(metric)||!(amount>0))return null;
    return {
      id:String(value.id||`quick-${index}-${metric}-${amount}`),
      metric,
      amount:Math.round((amount+Number.EPSILON)*1000)/1000
    };
  }
  function normalizeQuickPresets(values){
    const seen=new Set();
    return (Array.isArray(values)?values:[]).map(normalizeQuickPreset).filter(Boolean).filter(item=>{
      const key=`${item.metric}|${item.amount}`;
      if(seen.has(key))return false;
      seen.add(key);
      return true;
    });
  }
  function loadCalculatorQuickPresets(){
    try{calculatorQuickPresets=normalizeQuickPresets(JSON.parse(localStorage.getItem(CALC_QUICK_PRESETS_KEY)||"[]"));}
    catch(_){calculatorQuickPresets=[];}
    renderCalculatorQuickPresets();
  }
  function saveCalculatorQuickPresets(){
    calculatorQuickPresets=normalizeQuickPresets(calculatorQuickPresets);
    localStorage.setItem(CALC_QUICK_PRESETS_KEY,JSON.stringify(calculatorQuickPresets));
    renderCalculatorQuickPresets();
  }
  function quickPresetLabel(item){
    return `+${formatNumber(item.amount)} ${QUICK_METRIC_LABELS[item.metric]||item.metric}`;
  }

  function getProfileDisplayName(){
    return profileData.display_name||authUser?.username||"Користувач";
  }

  function profileInitials(){
    const source=getProfileDisplayName();
    const parts=String(source||"").trim().split(/\s+/).filter(Boolean);
    if(!parts.length)return "?";
    return (parts.length===1?parts[0].slice(0,2):(parts[0][0]+parts[1][0])).toUpperCase();
  }

  function renderProfile(){
    const displayName=getProfileDisplayName();
    const initials=profileInitials();
    const hasAvatar=!!profileData.avatar;

    if(profileDisplayName){
      profileDisplayName.textContent=displayName;
      const isAdmin=authUser?.role==="admin";
      profileDisplayName.disabled=!isAdmin;
      profileDisplayName.classList.toggle("admin-link",isAdmin);
      profileDisplayName.title=isAdmin?"Відкрити Admin":"";
    }

    [[profileAvatarSmall,profileAvatarInitials],[profileAvatarLarge,profileAvatarLargeInitials]].forEach(([imageEl,initialEl])=>{
      if(imageEl){
        if(hasAvatar){imageEl.src=profileData.avatar;imageEl.hidden=false;}
        else{imageEl.removeAttribute("src");imageEl.hidden=true;}
      }
      if(initialEl){initialEl.textContent=initials;initialEl.hidden=hasAvatar;}
    });

    if(profileDisplayInput)profileDisplayInput.value=profileData.display_name;
    if(profileDisplayCount)profileDisplayCount.textContent=String(profileData.display_name.length);
    if(profileFullName)profileFullName.value=profileData.full_name;
    if(profileBirthDate)profileBirthDate.value=profileData.birth_date;
    if(profileWeight)profileWeight.value=profileData.weight;
    if(profileHeight)profileHeight.value=profileData.height;
    if(profilePhotoRemove)profilePhotoRemove.disabled=!hasAvatar;
  }

  function loadProfile(){
    try{profileData=normalizeProfile(JSON.parse(localStorage.getItem(PROFILE_KEY)||"{}"));}
    catch(_){profileData=normalizeProfile({});}
    renderProfile();
  }

  function saveProfileLocal(){
    localStorage.setItem(PROFILE_KEY,JSON.stringify(profileData));
    renderProfile();
  }

  function collectProfileForm(avatar=profileData.avatar){
    return normalizeProfile({
      avatar,
      display_name:profileDisplayInput?.value||profileData.display_name,
      full_name:profileFullName?.value||profileData.full_name,
      birth_date:profileBirthDate?.value||profileData.birth_date,
      weight:profileWeight?.value||profileData.weight,
      height:profileHeight?.value||profileData.height
    });
  }

  async function resizeProfileImage(file){
    if(!file||!String(file.type||"").startsWith("image/"))throw new Error("Оберіть зображення.");
    const url=URL.createObjectURL(file);
    try{
      const image=new Image();
      image.decoding="async";
      await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error("Не вдалося прочитати фото."));image.src=url;});
      const side=Math.min(image.naturalWidth||image.width,image.naturalHeight||image.height);
      const sx=Math.max(0,((image.naturalWidth||image.width)-side)/2);
      const sy=Math.max(0,((image.naturalHeight||image.height)-side)/2);
      const canvas=document.createElement("canvas");
      canvas.width=384;canvas.height=384;
      const context=canvas.getContext("2d");
      if(!context)throw new Error("Не вдалося обробити фото.");
      context.drawImage(image,sx,sy,side,side,0,0,384,384);
      return canvas.toDataURL("image/jpeg",0.82);
    }finally{URL.revokeObjectURL(url);}
  }

  function fitTopTabLabels(){
    const nodes=[...document.querySelectorAll(".tabs .tab-label-sub,.tabs .tab-label-single")];

    nodes.forEach(node=>{
      node.style.removeProperty("font-size");
      const available=node.clientWidth;
      if(!available)return;

      let size=parseFloat(getComputedStyle(node).fontSize)||11.5;
      const isCalculator=!!node.closest('.tab[data-tab="calculator"]');
      const minSize=isCalculator?10.4:10.8;

      node.style.setProperty("font-size",`${size}px`,"important");

      let guard=0;
      while(node.scrollWidth>node.clientWidth+0.5&&size>minSize&&guard<20){
        size=Math.max(minSize,size-0.15);
        node.style.setProperty("font-size",`${size}px`,"important");
        guard++;
      }
    });
  }

  function scheduleTopTabFit(){
    requestAnimationFrame(()=>{
      requestAnimationFrame(fitTopTabLabels);
    });
    setTimeout(fitTopTabLabels,120);
  }

  function activateAppPage(target,{label="",save=true}={}){
    if(target==="admin"&&authUser?.role!=="admin")return;
    tabs.forEach(tab=>tab.classList.remove("active"));
    pages.forEach(page=>page.classList.remove("active"));
    document.querySelector(`.tab[data-tab="${target}"]`)?.classList.add("active");
    $(target)?.classList.add("active");
    if(save)localStorage.setItem(ACTIVE_TAB_KEY,target);
    if(label)logAction(`Відкрито вкладку «${label}».`);
    if(target==="archive"){renderArchive();requestAnimationFrame(()=>renderStatistics());}
    if(target==="calculator"){renderCalculatorLog();updateTotals();}
    if(target==="console")renderConsole();
    if(target==="profile")renderProfile();
    if(target==="admin"&&authUser?.role==="admin")loadAdminUsers(false);
  }

  function showAuthenticatedApp(user,{offline=false}={}){
    authUser=user;applyUserStorageNamespace(user.id);migrateLegacyDataToAdmin(user);
    if(adminTab)adminTab.hidden=user.role!=="admin";
    if(adminCurrentUsername)adminCurrentUsername.textContent=user.username||"—";
    loadProfile();
    document.body.classList.remove("auth-active");
    if(authScreen)authScreen.hidden=true;if(mainApp)mainApp.hidden=false;
    scheduleTopTabFit();
    if(!appInitialized)initializeAuthenticatedApp();
    if(user.role==="admin"&&!offline)loadAdminUsers(false);
    if(!offline)setTimeout(()=>void flushAuditQueue(),0);
  }

  async function completeAuthentication(session,remembered){
    authToken=session.token;authUser=session.user;authRemembered=!!remembered;persistAuthSession(session,authRemembered);showAuthenticatedApp(session.user);
  }

  async function bootstrapAuthentication(){
    document.body.classList.add("auth-active");switchAuthMode("login");
    const saved=getStoredAuthSession();
    if(!saved){authScreen.hidden=false;mainApp.hidden=true;return;}
    authToken=saved.token;authUser=saved.user;authRemembered=!!saved.remembered;setAuthMessage("Перевірка сесії...","info");
    try{const data=await authApi("/auth/me");authUser=data.user;updateStoredAuthUser(data.user);setAuthMessage("");showAuthenticatedApp(data.user);}
    catch(error){
      if(error?.status===0&&saved.user){setAuthMessage("");showAuthenticatedApp(saved.user,{offline:true});return;}
      clearAuthSession();authScreen.hidden=false;mainApp.hidden=true;setAuthMessage(error?.message||"Увійдіть знову.","error");
    }
  }

  async function performLogout(){
    const token=authToken;clearAuthSession();if(token){try{await authApi("/auth/logout",{method:"POST",token});}catch(_){}}location.reload();
  }

  const ADMIN_AUDIT_LABELS={
    account_created:"Реєстрація",
    login:"Вхід",
    logout:"Вихід",
    account_deleted:"Видалення акаунта",
    site_action:"Очищення сайту"
  };

  function isVisibleAdminAuditEvent(event){
    const type=String(event?.event_type||"");
    if(["account_created","login","logout","account_deleted"].includes(type))return true;
    return type==="site_action"&&isClearSiteAuditMessage(event?.message);
  }

  async function loadAdminAudit(){
    if(!authUser||authUser.role!=="admin"||!adminAuditList)return;
    if(adminAuditStatus)adminAuditStatus.textContent="Завантаження історії активності...";
    const data=await authApi("/admin/audit?limit=500");
    const rawEvents=Array.isArray(data.events)?data.events:[];
    const events=rawEvents.filter(isVisibleAdminAuditEvent);
    adminAuditList.innerHTML="";
    if(adminAuditCount)adminAuditCount.textContent=String(events.length);
    if(adminAuditStatus)adminAuditStatus.textContent=events.length?"Показано важливі події акаунтів.":"Історія активності порожня.";
    if(!events.length)return;

    events.forEach(event=>{
      const row=document.createElement("div");
      row.className=`admin-audit-row ${event.event_type==="account_deleted"?"deleted":""}`;

      const who=document.createElement("div");
      who.className="admin-audit-who";
      const whoStrong=document.createElement("strong");
      whoStrong.textContent=event.username||"—";
      const whoMeta=document.createElement("span");
      whoMeta.textContent=`ID: ${String(event.user_id??"—")}`;
      who.append(whoStrong,whoMeta);

      const badge=document.createElement("span");
      badge.className=`admin-audit-badge ${event.event_type==="account_deleted"?"deleted":""}`;
      badge.textContent=ADMIN_AUDIT_LABELS[event.event_type]||String(event.event_type||"Подія");

      const time=document.createElement("div");
      time.className="admin-audit-time";
      time.textContent=formatAdminDate(event.created_at);

      const message=document.createElement("div");
      message.className="admin-audit-message";
      message.textContent=event.message||"—";

      row.append(who,badge,time,message);
      adminAuditList.append(row);
    });
  }

  async function loadAdminUsers(showFeedback=true){
    if(!authUser||authUser.role!=="admin"||!adminUsersList)return;
    if(adminStatus)adminStatus.textContent="Завантаження користувачів...";
    try{
      const data=await authApi("/admin/users"),users=Array.isArray(data.users)?data.users:[];
      adminUsersList.innerHTML="";
      if(adminUsersCount)adminUsersCount.textContent=String(users.length);
      if(adminAdminsCount)adminAdminsCount.textContent=String(users.filter(user=>user.role==="admin").length);
      if(adminMembersCount)adminMembersCount.textContent=String(users.filter(user=>user.role!=="admin").length);
      if(adminStatus)adminStatus.textContent=users.length?"Дані актуальні.":"Користувачів поки немає.";
      users.forEach(user=>{
        const row=document.createElement("div");row.className="admin-user-row";
        const login=document.createElement("div");login.className="admin-user-cell";const loginStrong=document.createElement("strong");loginStrong.textContent=user.username||"—";const loginId=document.createElement("span");loginId.textContent=`ID: ${String(user.id)}`;login.append(loginStrong,loginId);
        const role=document.createElement("div");role.className="admin-user-cell";const badge=document.createElement("span");badge.className=`admin-role ${user.role==="admin"?"admin":""}`;badge.textContent=user.role==="admin"?"admin":"member";role.append(badge);
        const created=document.createElement("div");created.className="admin-user-cell admin-wide";const createdStrong=document.createElement("strong");createdStrong.textContent="Реєстрація";created.append(createdStrong,document.createTextNode(formatAdminDate(user.created_at)));
        const last=document.createElement("div");last.className="admin-user-cell admin-wide";const lastStrong=document.createElement("strong");lastStrong.textContent="Останній вхід";last.append(lastStrong,document.createTextNode(formatAdminDate(user.last_login_at)));
        const count=document.createElement("div");count.className="admin-user-cell";const countStrong=document.createElement("strong");countStrong.textContent="Входів";count.append(countStrong,document.createTextNode(String(user.login_count??0)));
        const history=document.createElement("button");history.type="button";history.className="admin-history-button";history.textContent="Історія";history.addEventListener("click",()=>openAdminLoginHistory(user));
        row.append(login,role,created,last,count,history);adminUsersList.append(row);
      });
      try{
        await loadAdminAudit();
        if(showFeedback)showButtonState(adminRefresh,"Оновлено","success");
      }catch(auditError){
        if(adminAuditStatus)adminAuditStatus.textContent=auditError?.message||"Не вдалося завантажити історію активності.";
        if(showFeedback)showButtonState(adminRefresh,"Частково","error");
      }
    }catch(error){if(adminStatus)adminStatus.textContent=error?.message||"Не вдалося завантажити Admin.";if(showFeedback)showButtonState(adminRefresh,"Помилка","error");}
  }

  async function openAdminLoginHistory(user){
    if(!adminLoginsModal||!adminLoginsList)return;
    adminLoginsUser.textContent=`${user.username||"Користувач"} · ${user.role||"member"}`;adminLoginsList.innerHTML='<div class="admin-login-entry">Завантаження...</div>';adminLoginsModal.classList.add("active");document.body.classList.add("edit-modal-open");
    try{const data=await authApi(`/admin/users/${encodeURIComponent(user.id)}/logins`),logins=Array.isArray(data.logins)?data.logins:[];adminLoginsList.innerHTML="";if(!logins.length){adminLoginsList.innerHTML='<div class="admin-login-entry">Історія входів порожня.</div>';return;}logins.forEach((entry,index)=>{const row=document.createElement("div");row.className="admin-login-entry";row.textContent=`${index+1}. ${formatAdminDate(entry.login_at)}`;adminLoginsList.append(row);});}
    catch(error){adminLoginsList.innerHTML="";const row=document.createElement("div");row.className="admin-login-entry";row.textContent=error?.message||"Не вдалося завантажити історію.";adminLoginsList.append(row);}
  }

  function closeAdminLoginHistory(){adminLoginsModal?.classList.remove("active");document.body.classList.remove("edit-modal-open");}

  const BUTTON_STATE_COLORS={
    success:{background:"#22c55e",shadow:"0 0 0 1px rgba(34,197,94,.30),0 0 18px rgba(34,197,94,.30)"},
    error:{background:"#ef4444",shadow:"0 0 0 1px rgba(239,68,68,.30),0 0 18px rgba(239,68,68,.30)"},
    info:{background:"#7289da",shadow:"0 0 0 1px rgba(114,137,218,.30),0 0 18px rgba(114,137,218,.30)"}
  };
  function restoreButtonInlineState(button){
    if(!button?._statusInlineSnapshot)return;
    const snapshot=button._statusInlineSnapshot;
    ["background-color","color","box-shadow"].forEach(property=>{
      const saved=snapshot[property];
      if(saved?.value)button.style.setProperty(property,saved.value,saved.priority||"");
      else button.style.removeProperty(property);
    });
    button._statusInlineSnapshot=null;
  }
  function applyButtonInlineState(button,state){
    const palette=BUTTON_STATE_COLORS[state];
    if(!button||!palette)return;
    if(!button._statusInlineSnapshot){
      button._statusInlineSnapshot={};
      ["background-color","color","box-shadow"].forEach(property=>{
        button._statusInlineSnapshot[property]={
          value:button.style.getPropertyValue(property),
          priority:button.style.getPropertyPriority(property)
        };
      });
    }
    button.style.setProperty("background-color",palette.background,"important");
    button.style.setProperty("color","#fff","important");
    button.style.setProperty("box-shadow",palette.shadow,"important");
  }
  function clearButtonStatus(button) {
    if(!button)return;
    button.classList.remove("button-status-success","button-status-error","button-status-info","button-status-entering","button-status-leaving");
    restoreButtonInlineState(button);
  }
  const BUTTON_FEEDBACK_MS = 1450;
  const BUTTON_STATUS_OUT_MS = 250;
  function showButtonState(button,text,state,duration=BUTTON_FEEDBACK_MS) {
    if (!button) return;
    if (!button.dataset.originalText) button.dataset.originalText = button.textContent.trim();

    clearTimeout(button._statusTimeout);
    clearTimeout(button._statusLeaveTimeout);
    clearButtonStatus(button);

    button.textContent = text;
    if (state) {
      void button.offsetWidth;
      button.classList.add(`button-status-${state}`,"button-status-entering");
      applyButtonInlineState(button,state);
    }

    const effectiveDuration=duration===0?0:BUTTON_FEEDBACK_MS;
    if (effectiveDuration > 0) {
      const leaveAt=Math.max(0,effectiveDuration-BUTTON_STATUS_OUT_MS);
      button._statusTimeout=setTimeout(()=>{
        button.classList.remove("button-status-entering");
        button.classList.add("button-status-leaving");
        button._statusLeaveTimeout=setTimeout(()=>{
          button.textContent=button.dataset.originalText||"";
          clearButtonStatus(button);
        },BUTTON_STATUS_OUT_MS);
      },leaveAt);
    }
  }
  function setButtonStatusPermanent(button,text,state) { showButtonState(button,text,state,0); }

  function formatConsoleDate(date = new Date()) {
    const d=String(date.getDate()).padStart(2,"0"),m=String(date.getMonth()+1).padStart(2,"0"),y=date.getFullYear();
    const h=String(date.getHours()).padStart(2,"0"),mi=String(date.getMinutes()).padStart(2,"0"),se=String(date.getSeconds()).padStart(2,"0");
    return `${d}.${m}.${y} - ${h}:${mi}:${se}`;
  }
  function saveConsoleLocal(){ localStorage.setItem(CONSOLE_KEY,JSON.stringify(consoleItems)); }

  let auditFlushInProgress=false;

  function isClearSiteAuditMessage(message){
    return String(message||"").trim()==="Очищено локальні дані сайту для поточного акаунта.";
  }

  function loadAuditQueue(){
    try{
      const value=JSON.parse(localStorage.getItem(AUDIT_QUEUE_KEY)||"[]");
      if(!Array.isArray(value))return [];
      const filtered=value.filter(item=>isClearSiteAuditMessage(item?.message));
      if(filtered.length!==value.length){
        localStorage.setItem(AUDIT_QUEUE_KEY,JSON.stringify(filtered.slice(-300)));
      }
      return filtered;
    }catch(_){return [];}
  }

  function saveAuditQueue(items){
    localStorage.setItem(AUDIT_QUEUE_KEY,JSON.stringify((Array.isArray(items)?items:[]).slice(-300)));
  }

  function queueAuditAction(message,occurredAt=new Date().toISOString()){
    if(!authUser)return;
    const queue=loadAuditQueue();
    queue.push({
      id:createId("audit"),
      message:String(message??"Невідома дія").slice(0,500),
      occurred_at:String(occurredAt||new Date().toISOString())
    });
    saveAuditQueue(queue);
    void flushAuditQueue();
  }

  async function flushAuditQueue(){
    if(auditFlushInProgress||!authToken||!navigator.onLine)return;
    const queue=loadAuditQueue();
    if(!queue.length)return;
    auditFlushInProgress=true;
    try{
      let remaining=[...queue];
      while(remaining.length&&authToken&&navigator.onLine){
        const item=remaining[0];
        try{
          await authApi("/audit/action",{method:"POST",body:{message:item.message,occurred_at:item.occurred_at}});
          remaining.shift();
          saveAuditQueue(remaining);
        }catch(error){
          if(error?.status===401||error?.status===403)break;
          if(error?.status===0)break;
          remaining.shift();
          saveAuditQueue(remaining);
        }
      }
    }finally{
      auditFlushInProgress=false;
    }
  }

  function logAction(message){
    const time=new Date().toISOString();
    const text=String(message ?? "Невідома дія");
    consoleItems.push({id:createId("console"),time,message:text});
    saveConsoleLocal();
    renderConsole();
  }
  function renderConsole(){
    if(!consoleLog)return; consoleLog.innerHTML="";
    if(!consoleItems.length){consoleLog.innerHTML='<div class="console-entry">Журнал дій порожній.</div>';return;}
    [...consoleItems].reverse().forEach(item=>{
      const row=document.createElement("div");row.className="console-entry";
      const dt=item.time?new Date(item.time):new Date();row.textContent=`[${formatConsoleDate(dt)}] ${item.message}`;consoleLog.append(row);
    });
  }

  function undoStorageValue(key){const value=localStorage.getItem(key);return value===null?null:value;}
  function saveUndoSnapshot(description){
    const snapshot={
      description:String(description||"Остання дія"),
      products:JSON.parse(JSON.stringify(products)),
      calculatorItems:JSON.parse(JSON.stringify(calculatorItems)),
      archiveItems:JSON.parse(JSON.stringify(archiveItems)),
      dailyGoal:JSON.parse(JSON.stringify(dailyGoal)),
      calcDraft:calcInput?calcInput.value:undoStorageValue(CALCULATOR_DRAFT_KEY),
      sort:currentSort,
      randomSortSeed:undoStorageValue(RANDOM_SORT_SEED_KEY),
      categoryOrder:undoStorageValue(CATEGORY_ORDER_KEY),
      customCategories:undoStorageValue(CUSTOM_CATEGORIES_KEY),
      deletedDefaultCategories:undoStorageValue(DELETED_DEFAULT_CATEGORIES_KEY),
      departmentsEnabled:undoStorageValue(DEPARTMENTS_ENABLED_KEY),
      profile:undoStorageValue(PROFILE_KEY),
      calculatorQuickPresets:undoStorageValue(CALC_QUICK_PRESETS_KEY),
      meta:{
        databaseUpdated:undoStorageValue(DATABASE_UPDATED_KEY),
        exportVersion:undoStorageValue(EXPORT_VERSION_KEY),
        exportFingerprint:undoStorageValue(EXPORT_FINGERPRINT_KEY),
        lastExport:undoStorageValue(LAST_EXPORT_KEY),
        lastImport:undoStorageValue(LAST_IMPORT_KEY)
      }
    };
    localStorage.setItem(UNDO_KEY,JSON.stringify(snapshot));
  }
  function restoreStorageValue(key,value){if(value===null||value===undefined)localStorage.removeItem(key);else localStorage.setItem(key,String(value));}
  function applyUndoSnapshot(){
    let snapshot=null;
    try{snapshot=JSON.parse(localStorage.getItem(UNDO_KEY)||"null");}catch(_){snapshot=null;}
    if(!snapshot){showButtonState(undoLastAction,"Немає дії","error",1500);logAction("Undo не виконано: немає дії для скасування.");return;}
    products=Array.isArray(snapshot.products)?snapshot.products.map((p,i)=>normalizeProduct(p,i)):products;
    calculatorItems=Array.isArray(snapshot.calculatorItems)?snapshot.calculatorItems:calculatorItems;
    archiveItems=Array.isArray(snapshot.archiveItems)?snapshot.archiveItems:archiveItems;
    if(snapshot.dailyGoal&&typeof snapshot.dailyGoal==="object")dailyGoal={...dailyGoal,...snapshot.dailyGoal};
    currentSort=snapshot.sort||"categories";
    localStorage.setItem(PRODUCTS_KEY,JSON.stringify(products));
    localStorage.setItem(CALCULATOR_KEY,JSON.stringify(calculatorItems));
    localStorage.setItem(ARCHIVE_KEY,JSON.stringify(archiveItems));
    localStorage.setItem(DAILY_GOAL_KEY,JSON.stringify(dailyGoal));
    localStorage.setItem(SORT_KEY,currentSort);
    restoreStorageValue(RANDOM_SORT_SEED_KEY,snapshot.randomSortSeed);
    restoreStorageValue(CATEGORY_ORDER_KEY,snapshot.categoryOrder);
    restoreStorageValue(CUSTOM_CATEGORIES_KEY,snapshot.customCategories);
    if(Object.prototype.hasOwnProperty.call(snapshot,"deletedDefaultCategories"))restoreStorageValue(DELETED_DEFAULT_CATEGORIES_KEY,snapshot.deletedDefaultCategories);
    restoreStorageValue(DEPARTMENTS_ENABLED_KEY,snapshot.departmentsEnabled);
    restoreStorageValue(PROFILE_KEY,snapshot.profile);
    if(Object.prototype.hasOwnProperty.call(snapshot,"calculatorQuickPresets"))restoreStorageValue(CALC_QUICK_PRESETS_KEY,snapshot.calculatorQuickPresets);
    departmentsEnabled=localStorage.getItem(DEPARTMENTS_ENABLED_KEY)!=="0";
    populateProductCategorySelects();
    loadProfile();
    loadCalculatorQuickPresets();
    if(calcInput){calcInput.value=snapshot.calcDraft||"";if(snapshot.calcDraft)localStorage.setItem(CALCULATOR_DRAFT_KEY,snapshot.calcDraft);else localStorage.removeItem(CALCULATOR_DRAFT_KEY);}
    const meta=snapshot.meta||{};
    restoreStorageValue(DATABASE_UPDATED_KEY,meta.databaseUpdated);
    restoreStorageValue(EXPORT_VERSION_KEY,meta.exportVersion);
    restoreStorageValue(EXPORT_FINGERPRINT_KEY,meta.exportFingerprint);
    restoreStorageValue(LAST_EXPORT_KEY,meta.lastExport);
    restoreStorageValue(LAST_IMPORT_KEY,meta.lastImport);
    localStorage.removeItem(UNDO_KEY);
    for(const key of Object.keys(goalInputs))if(goalInputs[key])goalInputs[key].value=dailyGoal[key]||"";
    updateSortOptionState();renderProducts(searchInput?.value||"");renderCalculatorLog();updateTotals();renderDailyGoal();renderArchive();renderStatistics();updateSiteDataCounts();
    showButtonState(undoLastAction,"Повернуто","success",1500);
    logAction(`Undo: скасовано дію «${snapshot.description||"Остання дія"}».`);
  }

  function createId(prefix="id") { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,9)}`; }
  function number(value) { const n=Number(value); return Number.isFinite(n)?n:0; }
  function round(value,decimals=1) { const f=10**decimals; return Math.round((number(value)+Number.EPSILON)*f)/f; }
  function formatNumber(value) {
    const n=number(value);
    const rounded=Math.round((n+Number.EPSILON)*1000)/1000;
    return String(Object.is(rounded,-0)?0:rounded);
  }
  function normalizeDisplayNumber(value,fallback){
    const raw=String(value??"").trim().replace(",",".");
    if(/^\d+(?:\.\d{1,3})?$/.test(raw))return raw;
    return formatNumber(fallback);
  }
  function productDisplayNumber(product,key){
    return normalizeDisplayNumber(product?.display?.[key],product?.[key]);
  }
  function getInitials(name) {
    const words=String(name||"").trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "?";
    return words.length===1?words[0].slice(0,2).toUpperCase():(words[0][0]+words[1][0]).toUpperCase();
  }
  function normalizeQuickWeights(values){
    const result=[];
    (Array.isArray(values)?values:[]).forEach(value=>{
      const weight=number(value);
      if(weight<=0)return;
      if(result.some(existing=>Math.abs(existing-weight)<1e-9))return;
      result.push(weight);
    });
    return result.slice(0,4);
  }
  function readQuickWeightInputs(inputs){
    return normalizeQuickWeights((inputs||[]).map(input=>input?.value));
  }
  function fillQuickWeightInputs(inputs,values){
    const normalized=normalizeQuickWeights(values);
    (inputs||[]).forEach((input,index)=>{if(input)input.value=normalized[index]===undefined?"":formatNumber(normalized[index]);});
  }

  function normalizeProduct(product,index=0) {
    const kcal=number(product.kcal);
    const protein=number(product.protein ?? product.proteins);
    const fat=number(product.fat);
    const carb=number(product.carb ?? product.carbs);
    const sugar=number(product.sugar ?? product.sugars);
    const salt=number(product.salt);
    const fiber=number(product.fiber ?? product.fibre);
    const incomingDisplay=product.display&&typeof product.display==="object"?product.display:{};
    return {
      id:String(product.id ?? createId("product")),
      name:String(product.name ?? "").trim(),
      kcal,
      kcal_no_data:Boolean(product.kcal_no_data ?? product.no_data?.kcal),
      protein,
      protein_no_data:Boolean(product.protein_no_data ?? product.no_data?.protein),
      fat,
      fat_no_data:Boolean(product.fat_no_data ?? product.no_data?.fat),
      carb,
      carb_no_data:Boolean(product.carb_no_data ?? product.no_data?.carb),
      sugar,
      sugar_no_data:Boolean(product.sugar_no_data ?? product.no_data?.sugar),
      salt,
      salt_no_data:Boolean(product.salt_no_data ?? product.no_data?.salt),
      fiber,
      fiber_no_data:Boolean(product.fiber_no_data ?? product.no_data?.fiber),
      display:{
        kcal:normalizeDisplayNumber(incomingDisplay.kcal ?? product.kcal,kcal),
        protein:normalizeDisplayNumber(incomingDisplay.protein ?? product.protein ?? product.proteins,protein),
        fat:normalizeDisplayNumber(incomingDisplay.fat ?? product.fat,fat),
        carb:normalizeDisplayNumber(incomingDisplay.carb ?? product.carb ?? product.carbs,carb),
        sugar:normalizeDisplayNumber(incomingDisplay.sugar ?? product.sugar ?? product.sugars,sugar),
        salt:normalizeDisplayNumber(incomingDisplay.salt ?? product.salt,salt),
        fiber:normalizeDisplayNumber(incomingDisplay.fiber ?? product.fiber ?? product.fibre,fiber)
      },
      unit:product.unit==="мл"?"мл":"г",
      category:String(product.category ?? product.category_id ?? "").trim(),
      quick_weights:normalizeQuickWeights(product.quick_weights ?? product.quickWeights ?? []),
      full_name:String(product.full_name ?? product.description ?? "").trim(),
      full_name_no_data:Boolean(product.full_name_no_data ?? product.description_no_data ?? product.no_data?.full_name),
      created_at:String(product.created_at || new Date(2000,0,1,0,0,index).toISOString())
    };
  }
  function loadArray(key) {
    try { const p=JSON.parse(localStorage.getItem(key)||"[]"); return Array.isArray(p)?p:[]; } catch { return []; }
  }
  function saveProductsLocal(){
    localStorage.setItem(PRODUCTS_KEY,JSON.stringify(products));
    localStorage.setItem(DATABASE_UPDATED_KEY,new Date().toISOString());
    updateSiteDataCounts();
  }
  function saveCalculatorLocal(){ localStorage.setItem(CALCULATOR_KEY,JSON.stringify(calculatorItems)); }
  function saveArchiveLocal(){ localStorage.setItem(ARCHIVE_KEY,JSON.stringify(archiveItems)); }
  function saveMedicinesLocal(){ localStorage.setItem(MEDICINES_KEY,JSON.stringify(medicines)); }
  function saveMedicineArchiveLocal(){ localStorage.setItem(MEDICINE_ARCHIVE_KEY,JSON.stringify(medicineArchive)); }
  function saveMedicineBuyLocal(){ localStorage.setItem(MEDICINE_BUY_KEY,JSON.stringify(medicineBuy)); }
  function saveCalculatorDraft(){ if(calcInput)localStorage.setItem(CALCULATOR_DRAFT_KEY,calcInput.value); }
  function updateSiteDataCounts(){
    if(siteProductsCount)siteProductsCount.textContent=String(products.length);
    if(siteArchiveCount)siteArchiveCount.textContent=String(archiveItems.length);
    if(siteDatabaseUpdated){
      const raw=localStorage.getItem(DATABASE_UPDATED_KEY);
      if(!raw){siteDatabaseUpdated.textContent="Ще не оновлювалася";}
      else{const d=new Date(raw);siteDatabaseUpdated.textContent=`${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()} о ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;}
    }
    if(siteLastExport){
      const raw=localStorage.getItem(LAST_EXPORT_KEY);
      if(!raw)siteLastExport.textContent="Ще не виконувався";
      else{
        const then=new Date(raw),now=new Date();
        const startThen=new Date(then.getFullYear(),then.getMonth(),then.getDate());
        const startNow=new Date(now.getFullYear(),now.getMonth(),now.getDate());
        const days=Math.max(0,Math.round((startNow-startThen)/86400000));
        siteLastExport.textContent=days===0?"сьогодні":days===1?"1 день тому":`${days} днів тому`;
      }
    }
    if(siteLastImport){
      const raw=localStorage.getItem(LAST_IMPORT_KEY);
      if(!raw)siteLastImport.textContent="Ще не виконувався";
      else{
        const then=new Date(raw),now=new Date();
        const startThen=new Date(then.getFullYear(),then.getMonth(),then.getDate());
        const startNow=new Date(now.getFullYear(),now.getMonth(),now.getDate());
        const days=Math.max(0,Math.round((startNow-startThen)/86400000));
        siteLastImport.textContent=days===0?"сьогодні":days===1?"1 день тому":`${days} днів тому`;
      }
    }
    if(siteCurrentDate){const d=new Date();siteCurrentDate.textContent=`${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;}
  }
  function exportFingerprint(){
    return JSON.stringify({
      products:products.map((p,i)=>normalizeProduct(p,i)),
      archive:archiveItems,
      category_order:getCategoryOrder(),
      custom_categories:getCustomCategories().map(({id,label})=>({id,label})),
      departments_enabled:departmentsEnabled,
      profile:normalizeProfile(profileData),
      calculator_quick_presets:normalizeQuickPresets(calculatorQuickPresets)
    });
  }
  function getExportVersion(){
    const fingerprint=exportFingerprint();
    const previous=localStorage.getItem(EXPORT_FINGERPRINT_KEY);
    let version=Math.max(0,parseInt(localStorage.getItem(EXPORT_VERSION_KEY)||"0",10)||0);
    if(previous!==fingerprint){version+=1;localStorage.setItem(EXPORT_VERSION_KEY,String(version));localStorage.setItem(EXPORT_FINGERPRINT_KEY,fingerprint);}
    if(version<1){version=1;localStorage.setItem(EXPORT_VERSION_KEY,"1");localStorage.setItem(EXPORT_FINGERPRINT_KEY,fingerprint);}
    return version;
  }
  function productNameCompare(a,b){
    return String(a?.name||"").localeCompare(String(b?.name||""),"uk",{sensitivity:"base",numeric:true});
  }
  function stableRandomValue(product,seed){
    const text=`${String(product?.id||product?.name||"")}|${seed}`;
    let hash=2166136261;
    for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619);}
    return hash>>>0;
  }
  function getSortedProducts() {
    const arr=[...products];
    if(currentSort==="oldest")arr.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
    else if(currentSort==="newest")arr.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    else if(currentSort==="list")arr.sort(productNameCompare);
    else if(currentSort==="random"){
      const seed=localStorage.getItem(RANDOM_SORT_SEED_KEY)||"0";
      arr.sort((a,b)=>stableRandomValue(a,seed)-stableRandomValue(b,seed));
    }else if(currentSort==="categories"&&departmentsEnabled){
      const orderIndex=new Map(getCategoryOrder().map((id,index)=>[id,index]));
      arr.sort((a,b)=>{
        const ca=orderIndex.get(getProductCategory(a).id)??9999;
        const cb=orderIndex.get(getProductCategory(b).id)??9999;
        return ca-cb||productNameCompare(a,b);
      });
    }
    // "initial" and "manual" preserve the current database order.
    return arr;
  }

  const PRODUCT_CATEGORIES=[
    {
      id:"frozen",label:"Заморожені продукти",
      aliases:["заморожені продукти","заморожені","заморозка","frozen"],
      patterns:[/заморож/i,/\bfrozen\b/i]
    },
    {
      id:"eggs",label:"Яйця",
      aliases:["яйця","яєчні продукти"],
      patterns:[/яйц/i,/\begg(s)?\b/i]
    },
    {
      id:"dairy",label:"Молочні продукти",
      aliases:["молочні продукти","молочні","молочка"],
      patterns:[/молок/i,/кефір/i,/йогурт/i,/сметан/i,/вершк/i,/ряжанк/i,/творог/i,/(^|\s)сир(\s|$|[,.:;])/i,/моцарел/i,/пармезан/i,/бринз/i,/\bmilk\b/i,/\byogurt\b/i,/\byoghurt\b/i,/\bcheese\b/i,/\bkefir\b/i]
    },
    {
      id:"meat",label:"М’ясо та птиця",
      aliases:["м’ясо та птиця","мясо та птиця","м’ясо","мясо","птиця"],
      patterns:[/кур(ка|яч|ин)/i,/індич/i,/ялович/i,/теляч/i,/свинин/i,/м.?яс/i,/фарш/i,/ковбас/i,/шинка/i,/бекон/i,/салям/i,/сосиск/i,/кролик/i,/\bchicken\b/i,/\bturkey\b/i,/\bbeef\b/i,/\bpork\b/i]
    },
    {
      id:"fish",label:"Риба та морепродукти",
      aliases:["риба та морепродукти","риба","морепродукти"],
      patterns:[/риб/i,/лосос/i,/форел/i,/тун(ець|ця)/i,/скумбр/i,/оселед/i,/кревет/i,/кальмар/i,/міді/i,/морепродукт/i,/\bsalmon\b/i,/\btuna\b/i,/\btrout\b/i,/\bshrimp\b/i,/\bfish\b/i]
    },
    {
      id:"grains",label:"Крупи, макарони та бобові",
      aliases:["крупи, макарони та бобові","крупи","каші","каша","макарони","бобові"],
      patterns:[/рис/i,/вівсян/i,/овсян/i,/греч/i,/булгур/i,/кус.?кус/i,/кіноа/i,/круп/i,/каш/i,/макарон/i,/спагет/i,/локшин/i,/паст(а|и)(\s|$)/i,/сочевиц/i,/квасол/i,/нут(\s|$|[,.:;])/i,/горох/i,/\boats?\b/i,/\brice\b/i,/\bpasta\b/i,/\bquinoa\b/i]
    },
    {
      id:"bakery",label:"Хліб та випічка",
      aliases:["хліб та випічка","хліб","випічка"],
      patterns:[/хліб/i,/лаваш/i,/булоч/i,/багет/i,/тостов/i,/круасан/i,/випіч/i,/борошн/i,/тортил/i,/\bbread\b/i,/\bflour\b/i]
    },
    {
      id:"vegetables",label:"Овочі, зелень та гриби",
      aliases:["овочі, зелень та гриби","овочі","зелень","гриби"],
      patterns:[/картопл/i,/моркв/i,/огір/i,/помід/i,/томат(\s|$|[,.:;])/i,/цибул/i,/часник/i,/брокол/i,/капуст/i,/буряк/i,/кабач/i,/баклаж/i,/болгарськ.*перець/i,/перець.*болгарськ/i,/селера/i,/шпинат/i,/рукол/i,/зелень/i,/гриб/i,/печериц/i,/кукурудз/i,/\bpotato\b/i,/\btomato\b/i,/\bcucumber\b/i]
    },
    {
      id:"fruits",label:"Фрукти та ягоди",
      aliases:["фрукти та ягоди","фрукти","ягоди"],
      patterns:[/банан/i,/яблук/i,/ківі/i,/апельсин/i,/мандарин/i,/лимон/i,/груш/i,/виноград/i,/персик/i,/нектарин/i,/ананас/i,/манго/i,/авокад/i,/лохин/i,/чорниц/i,/полуниц/i,/малин/i,/смородин/i,/вишн/i,/черешн/i,/ягод/i,/\bbanana\b/i,/\bapple\b/i,/\bkiwi\b/i,/\bberry\b/i]
    },
    {
      id:"nuts",label:"Горіхи, насіння та сухофрукти",
      aliases:["горіхи, насіння та сухофрукти","горіхи","насіння","сухофрукти"],
      patterns:[/горіх/i,/мигдал/i,/кеш.?ю/i,/пекан/i,/фісташ/i,/арахіс/i,/насін/i,/кунжут/i,/родзин/i,/кураг/i,/фінік/i,/сухофрукт/i,/\bnut(s)?\b/i,/\balmond/i,/\bseed(s)?\b/i]
    },
    {
      id:"condiments",label:"Соуси, олії та приправи",
      aliases:["соуси, олії та приправи","соуси","олії","приправи","спеції"],
      patterns:[/соус/i,/кетчуп/i,/майонез/i,/гірчиц/i,/олія/i,/масло олив/i,/оливков.*масло/i,/паприк/i,/спеці/i,/приправа/i,/імбир/i,/кориц/i,/сіль(\s|$|[,.:;])/i,/перець(\s|$|[,.:;])/i,/чилі/i,/\bsauce\b/i,/\boil\b/i,/\bspice/i]
    },
    {
      id:"sports",label:"Спортивне харчування",
      aliases:["спортивне харчування","спортхарчування","спортпіт"],
      patterns:[/протеїн/i,/гейнер/i,/ізолят/i,/whey/i,/protein powder/i,/mass gainer/i]
    },
    {
      id:"sweets",label:"Солодощі та снеки",
      aliases:["солодощі та снеки","солодощі","снеки"],
      patterns:[/шоколад/i,/цукерк/i,/печив/i,/вафл/i,/батончик/i,/чіпс/i,/снек/i,/морозиво/i,/десерт/i,/мармелад/i,/зефір/i,/мед(\s|$|[,.:;])/i,/\bchocolate\b/i,/\bcandy\b/i,/\bcookie/i,/\bchips\b/i]
    },
    {
      id:"ready",label:"Готові страви",
      aliases:["готові страви","готова їжа","готові продукти"],
      patterns:[/піца/i,/бургер/i,/сендвіч/i,/бутерброд/i,/вареник/i,/пельмен/i,/суші/i,/рол(и|\s|$)/i,/шаурм/i,/готова страва/i,/готовий обід/i,/\bpizza\b/i,/\bburger\b/i,/\bsushi\b/i]
    },
    {
      id:"drinks",label:"Напої",
      aliases:["напої","газіровки","газировка","газовані напої","енергетики"],
      patterns:[/red bull/i,/ред бул/i,/coca.?cola/i,/кока.?кол/i,/pepsi/i,/пепсі/i,/sprite/i,/спрайт/i,/fanta/i,/фанта/i,/газован/i,/енергетик/i,/напій/i,/напиток/i,/вода(\s|$|[,.:;])/i,/сік(\s|$|[,.:;])/i,/кава/i,/coffee/i,/чай(\s|$|[,.:;])/i,/juice/i]
    },
    {
      id:"other",label:"Інше",
      aliases:["інше","інші продукти"],
      patterns:[]
    }
  ];

  function normalizeCustomCategoryItem(item){
    if(!item||typeof item!=="object")return null;
    const id=String(item.id||"").trim();
    const label=String(item.label||"").trim().slice(0,40);
    if(!id.startsWith("custom-")||!label)return null;
    return {id,label,aliases:[label],patterns:[],custom:true};
  }

  function getCustomCategories(){
    try{
      const raw=JSON.parse(localStorage.getItem(CUSTOM_CATEGORIES_KEY)||"[]");
      if(!Array.isArray(raw))return [];
      const seen=new Set();
      return raw.map(normalizeCustomCategoryItem).filter(item=>{
        if(!item||seen.has(item.id))return false;
        seen.add(item.id);return true;
      });
    }catch(_){return [];}
  }

  function saveCustomCategories(items){
    const normalized=(Array.isArray(items)?items:[]).map(normalizeCustomCategoryItem).filter(Boolean);
    localStorage.setItem(CUSTOM_CATEGORIES_KEY,JSON.stringify(normalized.map(({id,label})=>({id,label}))));
  }

  function getDeletedDefaultCategoryIds(){
    try{
      const raw=JSON.parse(localStorage.getItem(DELETED_DEFAULT_CATEGORIES_KEY)||"[]");
      if(!Array.isArray(raw))return [];
      const valid=new Set(PRODUCT_CATEGORIES.map(category=>category.id));
      return [...new Set(raw.map(id=>String(id||"")).filter(id=>valid.has(id)))];
    }catch(_){return [];}
  }

  function saveDeletedDefaultCategoryIds(ids){
    const valid=new Set(PRODUCT_CATEGORIES.map(category=>category.id));
    const normalized=[...new Set((Array.isArray(ids)?ids:[]).map(id=>String(id||"")).filter(id=>valid.has(id)))];
    localStorage.setItem(DELETED_DEFAULT_CATEGORIES_KEY,JSON.stringify(normalized));
  }

  function getAllCategories(){
    const deleted=new Set(getDeletedDefaultCategoryIds());
    return [...PRODUCT_CATEGORIES.filter(category=>!deleted.has(category.id)),...getCustomCategories()];
  }

  function createCustomCategoryId(){
    return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
  }

  function populateProductCategorySelects(){
    [newProductCategory,editProductCategory].forEach((select,index)=>{
      if(!select)return;
      select.innerHTML="";
      if(index===0){
        const placeholder=document.createElement("option");
        placeholder.value="";
        placeholder.textContent="Оберіть відділ...";
        placeholder.disabled=true;
        placeholder.selected=true;
        select.append(placeholder);
      }
      getAllCategories().forEach(category=>{
        const option=document.createElement("option");
        option.value=category.id;
        option.textContent=category.label;
        select.append(option);
      });
    });
  }
  populateProductCategorySelects();

  function defaultCategoryOrder(){
    return getAllCategories().map(category=>category.id);
  }
  function normalizeCategoryOrder(value){
    const valid=new Set(defaultCategoryOrder());
    const raw=Array.isArray(value)?value:[];
    const seen=new Set();
    const result=[];
    raw.forEach(id=>{
      const key=String(id||"");
      if(valid.has(key)&&!seen.has(key)){seen.add(key);result.push(key);}
    });
    defaultCategoryOrder().forEach(id=>{
      if(!seen.has(id)){seen.add(id);result.push(id);}
    });
    return result;
  }
  function getCategoryOrder(){
    try{
      const parsed=JSON.parse(localStorage.getItem(CATEGORY_ORDER_KEY)||"[]");
      return normalizeCategoryOrder(parsed);
    }catch(_){
      return defaultCategoryOrder();
    }
  }
  function saveCategoryOrder(order){
    localStorage.setItem(CATEGORY_ORDER_KEY,JSON.stringify(normalizeCategoryOrder(order)));
  }
  function getOrderedCategories(){
    const byId=new Map(getAllCategories().map(category=>[category.id,category]));
    return getCategoryOrder().map(id=>byId.get(id)).filter(Boolean);
  }

  function normalizeCategorySearch(value){
    return String(value||"").toLowerCase().replace(/[’'`]/g,"").replace(/\s+/g," ").trim();
  }
  function getProductCategory(product){
    const allCategories=getAllCategories();
    const explicit=allCategories.find(category=>category.id===String(product?.category||"").trim());
    if(explicit)return explicit;
    const activeIds=new Set(allCategories.map(category=>category.id));
    const text=normalizeCategorySearch(`${product?.name||""} ${product?.full_name||""}`);
    const classified=PRODUCT_CATEGORIES.find(category=>activeIds.has(category.id)&&category.id!=="other"&&category.patterns.some(pattern=>pattern.test(text)));
    if(classified)return classified;
    const other=allCategories.find(category=>category.id==="other");
    if(other)return other;
    return {id:"__uncategorized__",label:"",aliases:[],patterns:[],synthetic:true};
  }
  function categoryMatchesSearch(category,query){
    if(!query)return false;
    const q=normalizeCategorySearch(query);
    return [category.label,...category.aliases].some(value=>{
      const v=normalizeCategorySearch(value);
      return v===q||v.includes(q);
    });
  }
  function categoryExactSearch(category,query){
    if(!query)return false;
    const q=normalizeCategorySearch(query);
    return [category.label,...category.aliases].some(value=>normalizeCategorySearch(value)===q);
  }
  function createCategorySeparator(category,count){
    const separator=document.createElement("div");
    separator.className="product-category-separator";
    separator.dataset.category=category.id;
    const label=document.createElement("span");
    label.textContent=category.label;
    const amount=document.createElement("small");
    amount.textContent=String(count);
    separator.append(label,amount);
    return separator;
  }

  tabs.forEach(tab=>tab.addEventListener("click",()=>{
    const target=tab.dataset.tab;
    const tabLabel=tab.textContent.trim().replace(/:$/," ").trim();
    activateAppPage(target,{label:tabLabel});
  }));

  profileOpen?.addEventListener("click",()=>activateAppPage("profile",{label:"Профіль"}));
  profileDisplayName?.addEventListener("click",()=>{
    if(authUser?.role==="admin")activateAppPage("admin",{label:"Admin"});
  });

  profileDisplayInput?.addEventListener("input",()=>{
    if(profileDisplayInput.value.length>20)profileDisplayInput.value=profileDisplayInput.value.slice(0,20);
    if(profileDisplayCount)profileDisplayCount.textContent=String(profileDisplayInput.value.length);
  });

  profilePhotoButton?.addEventListener("click",()=>profilePhotoInput?.click());
  profilePhotoChange?.addEventListener("click",()=>profilePhotoInput?.click());
  profilePhotoInput?.addEventListener("change",async()=>{
    const file=profilePhotoInput.files?.[0];
    if(!file)return;
    try{
      const avatar=await resizeProfileImage(file);
      saveUndoSnapshot("Зміна фото профілю");
      profileData=collectProfileForm(avatar);
      saveProfileLocal();
      showButtonState(profilePhotoChange,"Фото збережено","success");
      logAction("Фото профілю змінено.");
    }catch(error){
      showButtonState(profilePhotoChange,"Помилка","error");
      alert(error?.message||"Не вдалося обробити фото.");
    }finally{
      profilePhotoInput.value="";
    }
  });

  profilePhotoRemove?.addEventListener("click",()=>{
    if(!profileData.avatar)return;
    saveUndoSnapshot("Видалення фото профілю");
    profileData=collectProfileForm("");
    saveProfileLocal();
    showButtonState(profilePhotoRemove,"Видалено","success");
    logAction("Фото профілю видалено.");
  });

  profileSave?.addEventListener("click",()=>{
    saveUndoSnapshot("Зміна профілю");
    profileData=collectProfileForm(profileData.avatar);
    saveProfileLocal();
    showButtonState(profileSave,"Збережено","success");
    logAction("Профіль збережено.");
    setTimeout(()=>activateAppPage("blocks",{label:"КБЖВ Блоки"}),360);
  });

  function renderProducts(filter="") {
    if(!grid)return;
    updateSiteDataCounts();
    const q=normalizeCategorySearch(filter);
    grid.innerHTML="";

    const sorted=getSortedProducts();
    const orderedCategories=getOrderedCategories();
    const categoryHits=q?orderedCategories.filter(category=>categoryMatchesSearch(category,q)):[];
    const categoryHitIds=new Set(categoryHits.map(category=>category.id));
    const productMatches=product=>{
      if(!q)return true;
      const category=getProductCategory(product);
      if(categoryHitIds.has(category.id))return true;
      const searchable=normalizeCategorySearch(`${product.name||""} ${product.full_name||""}`);
      return searchable.includes(q);
    };
    const filtered=sorted.filter(productMatches);

    if(!filtered.length){
      const empty=document.createElement("div");
      empty.style.cssText="grid-column:1/-1;text-align:center;padding:30px;color:var(--text-secondary)";
      empty.textContent="Продуктів не знайдено.";
      grid.appendChild(empty); return;
    }

    const exactCategory=categoryHits.find(category=>categoryExactSearch(category,q));
    const groupedView=departmentsEnabled&&(currentSort==="categories"||categoryHits.length>0);

    if(groupedView){
      const renderedIds=new Set();
      orderedCategories.forEach(category=>{
        const group=filtered.filter(product=>getProductCategory(product).id===category.id);
        if(!group.length)return;
        grid.appendChild(createCategorySeparator(category,group.length));
        group.forEach(product=>{renderedIds.add(product.id);grid.appendChild(createProductCard(product));});
      });
      filtered.filter(product=>!renderedIds.has(product.id)).forEach(product=>grid.appendChild(createProductCard(product)));
    }else{
      filtered.forEach(product=>grid.appendChild(createProductCard(product)));
    }

    updateReorderState();

    if(exactCategory&&groupedView){
      requestAnimationFrame(()=>{
        grid.querySelector(`.product-category-separator[data-category="${exactCategory.id}"]`)?.scrollIntoView({behavior:"smooth",block:"start"});
      });
    }
  }

  function iconCopy(){
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M16 21H6a2 2 0 0 1-2-2V7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><rect x="8" y="3" width="13" height="13" rx="2" stroke="currentColor" stroke-width="1.6"/></svg><span class="tooltip">Скопіювати</span>`;
  }
  function iconEdit(){
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 20h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg><span class="tooltip">Редагувати</span>`;
  }
  function createProductCard(product){
    const card=document.createElement("article");
    card.className="food-card"; card.dataset.id=product.id;
    const actions=document.createElement("div"); actions.className="card-actions";
    const copy=document.createElement("button"); copy.type="button"; copy.className="copy-btn"; copy.innerHTML=iconCopy();
    const edit=document.createElement("button"); edit.type="button"; edit.className="edit-btn"; edit.innerHTML=iconEdit();
    copy.addEventListener("click",e=>{e.stopPropagation();openProductModal(product);});
    edit.addEventListener("click",e=>{e.stopPropagation();openEditProductModal(product);});
    actions.append(copy,edit);

    const title=document.createElement("div"); title.className="food-title";
    const badge=document.createElement("div"); badge.className="badge"; badge.textContent=getInitials(product.name);
    const tc=document.createElement("div");
    const name=document.createElement("div"); name.className="name"; name.textContent=product.name;
    const meta=document.createElement("div"); meta.className="meta"; meta.textContent=`100 ${product.unit||"г"}`;
    tc.append(name,meta); title.append(badge,tc);

    const kbjv=document.createElement("div"); kbjv.className="kbjv";
    const row=(key,val,unit="г",noData=false,displayValue=null)=>`<div class="row"><div class="key">${key}</div><div class="val${noData?" no-data-value":""}">${noData?"Немає даних":`${displayValue??formatNumber(val)} ${unit}`}</div></div>`;
    kbjv.innerHTML =
      row("Калорії",product.kcal,"ккал",product.kcal_no_data,productDisplayNumber(product,"kcal")) +
      `<div class="kbjv-divider"></div>` +
      row("Білки",product.protein,"г",product.protein_no_data,productDisplayNumber(product,"protein")) +
      row("Жири",product.fat,"г",product.fat_no_data,productDisplayNumber(product,"fat")) +
      row("Вуглеводи",product.carb,"г",product.carb_no_data,productDisplayNumber(product,"carb")) +
      `<div class="kbjv-divider"></div>` +
      row("Цукри",product.sugar,"г",product.sugar_no_data,productDisplayNumber(product,"sugar")) +
      row("Сіль",product.salt,"г",product.salt_no_data,productDisplayNumber(product,"salt")) +
      `<div class="kbjv-divider"></div>` +
      row("Клітковина",product.fiber,"г",product.fiber_no_data,productDisplayNumber(product,"fiber")) +
      `<div class="kbjv-divider"></div>`;

    const full=document.createElement("div"); full.className="full-name";
    full.textContent=product.full_name_no_data?"Немає даних":(product.full_name||"");
    if(product.full_name_no_data)full.classList.add("no-data-value");
    card.append(actions,title,kbjv,full);
    card.addEventListener("click",e=>{if(!reorderMode&&!e.target.closest(".card-actions"))openProductModal(product);});
    return card;
  }

  searchInput?.addEventListener("input",()=>{renderProducts(searchInput.value);clearSearch.style.display=searchInput.value?"block":"none";});
  clearSearch?.addEventListener("click",()=>{const hadValue=!!searchInput.value.trim();searchInput.value="";clearSearch.style.display="none";renderProducts();searchInput.focus();if(hadValue)logAction("Пошук продуктів очищено.");});

  function renderProductQuickWeights(product){
    if(!productQuickWeights)return;
    productQuickWeights.innerHTML="";
    const weights=normalizeQuickWeights(product?.quick_weights);
    productQuickWeights.hidden=!weights.length;
    weights.forEach(weight=>{
      const button=document.createElement("button");
      button.type="button";
      button.className="product-quick-weight-button";
      button.textContent=`${formatNumber(weight)} г`;
      button.addEventListener("click",()=>{
        productWeight.value=formatNumber(weight);
        productQuickWeights.querySelectorAll(".product-quick-weight-button").forEach(item=>item.classList.toggle("active",item===button));
      });
      productQuickWeights.append(button);
    });
  }
  function openProductModal(product){
    selectedProduct=product;
    productModalName.textContent=product.name;
    productWeight.value="";
    renderProductQuickWeights(product);
    productModal.classList.add("active");
    document.body.classList.add("edit-modal-open");
    try{productWeight.focus({preventScroll:true});}catch(_){productWeight.focus();}
    requestAnimationFrame(()=>{try{productWeight.focus({preventScroll:true});}catch(_){productWeight.focus();}});
    logAction(`Відкрито продукт «${product.name}».`);
  }
  function closeProductModal(){selectedProduct=null;productModal.classList.remove("active");document.body.classList.remove("edit-modal-open");if(productQuickWeights){productQuickWeights.innerHTML="";productQuickWeights.hidden=true;}}
  productCancel?.addEventListener("click",()=>{
    showButtonState(productCancel,"Скасовано","error",700);
    logAction("Перегляд продукту закрито без дії.");
    setTimeout(closeProductModal,260);
  });
  productModal?.addEventListener("click",e=>{if(e.target===productModal)closeProductModal();});
  productModal?.addEventListener("touchmove",e=>{if(e.target===productModal)e.preventDefault();},{passive:false});

  function calculateProduct(product,weight){
    const m=number(weight)/100;
    return {kcal:product.kcal*m,protein:product.protein*m,fat:product.fat*m,carb:product.carb*m,sugar:product.sugar*m,salt:product.salt*m,fiber:product.fiber*m};
  }
  function getProductSummary(product,weight){
    const v=calculateProduct(product,weight);
    const isBase=Math.abs(number(weight)-100)<1e-9;
    const shown=(key,value)=>isBase?productDisplayNumber(product,key):formatNumber(value);
    const kcalText=product.kcal_no_data?"немає даних калорій":`${shown("kcal",v.kcal)} ккал`;
    const proteinText=product.protein_no_data?"немає даних білків":`${shown("protein",v.protein)} білка`;
    const fatText=product.fat_no_data?"немає даних жирів":`${shown("fat",v.fat)} жирів`;
    const carbText=product.carb_no_data?"немає даних вуглеводів":`${shown("carb",v.carb)} вуглеводів`;
    const sugarText=product.sugar_no_data?"немає даних цукрів":`${shown("sugar",v.sugar)} цукрів`;
    const saltText=product.salt_no_data?"немає даних солі":`${shown("salt",v.salt)} солі`;
    const fiberText=product.fiber_no_data?"немає даних клітковини":`${shown("fiber",v.fiber)} клітковини`;
    return `${product.name}, для ${formatNumber(weight)} грам - ${kcalText} / ${proteinText} / ${fatText} / ${carbText} / ${sugarText} / ${saltText} / ${fiberText}`;
  }
  async function copyText(text){
    try{await navigator.clipboard.writeText(text);return true;}catch{
      const t=document.createElement("textarea");t.value=text;t.style.position="fixed";t.style.left="-9999px";document.body.append(t);t.select();document.execCommand("copy");t.remove();return true;
    }
  }
  productCopy?.addEventListener("click",async()=>{
    if(!selectedProduct)return; const w=number(productWeight.value); if(w<=0)return productWeight.focus();
    if(await copyText(getProductSummary(selectedProduct,w))){showButtonState(productCopy,"Скопійовано","success",1200);logAction(`Скопійовано продукт «${selectedProduct.name}» (${formatNumber(w)} г).`);}
  });
  productCalculator?.addEventListener("click",()=>{
    if(!selectedProduct)return; const w=number(productWeight.value); if(w<=0)return productWeight.focus();
    const productName=selectedProduct.name;
    const text=getProductSummary(selectedProduct,w);
    saveUndoSnapshot(`Додавання продукту «${productName}» у поле калькулятора`);
    const current=calcInput.value.trim(); calcInput.value=current?`${current}\n${text}`:text; saveCalculatorDraft();
    showButtonState(productCalculator,"Додано","success"); logAction(`Продукт «${productName}» додано в калькулятор.`);
    setTimeout(closeProductModal,260);
  });

  function setNoDataField(input,checkbox,active,emptyValue="0"){
    if(!input||!checkbox)return;
    checkbox.checked=!!active;
    input.disabled=!!active;
    if(active)input.value=emptyValue;
  }
  const noDataFieldPairs=[
    [newProductKcal,newProductKcalNoData,"0"],
    [newProductProtein,newProductProteinNoData,"0"],
    [newProductFat,newProductFatNoData,"0"],
    [newProductCarb,newProductCarbNoData,"0"],
    [newProductSugar,newProductSugarNoData,"0"],
    [newProductSalt,newProductSaltNoData,"0"],
    [newProductFiber,newProductFiberNoData,"0"],
    [newProductDescription,newProductDescriptionNoData,""],
    [editProductKcal,editProductKcalNoData,"0"],
    [editProductProtein,editProductProteinNoData,"0"],
    [editProductFat,editProductFatNoData,"0"],
    [editProductCarb,editProductCarbNoData,"0"],
    [editProductSugar,editProductSugarNoData,"0"],
    [editProductSalt,editProductSaltNoData,"0"],
    [editProductFiber,editProductFiberNoData,"0"],
    [editProductDescription,editProductDescriptionNoData,""]
  ];
  noDataFieldPairs.forEach(([input,checkbox,emptyValue])=>checkbox?.addEventListener("change",()=>setNoDataField(input,checkbox,checkbox.checked,emptyValue)));

  function clearAddForm(){
    [newProductName,newProductKcal,newProductProtein,newProductFat,newProductCarb,newProductSugar,newProductSalt,newProductFiber,newProductDescription].forEach(el=>el.value="");
    newProductQuickWeights.forEach(input=>input.value="");
    if(newProductCategory)newProductCategory.value="";
    [
      [newProductKcal,newProductKcalNoData,"0"],
      [newProductProtein,newProductProteinNoData,"0"],
      [newProductFat,newProductFatNoData,"0"],
      [newProductCarb,newProductCarbNoData,"0"],
      [newProductSugar,newProductSugarNoData,"0"],
      [newProductSalt,newProductSaltNoData,"0"],
      [newProductFiber,newProductFiberNoData,"0"],
      [newProductDescription,newProductDescriptionNoData,""]
    ].forEach(([input,checkbox,emptyValue])=>setNoDataField(input,checkbox,false,emptyValue));
  }
  addProductButton?.addEventListener("click",()=>{clearAddForm();addProductModal.classList.add("active");document.body.classList.add("edit-modal-open");logAction("Відкрито додавання продукту.");setTimeout(()=>newProductName.focus(),50);});
  addProductCancel?.addEventListener("click",()=>{showButtonState(addProductCancel,"Скасовано","error",500);setTimeout(()=>{addProductModal.classList.remove("active");document.body.classList.remove("edit-modal-open");requestAnimationFrame(()=>showButtonState(addProductButton,"Продукт не додано","error"));},260);logAction("Додавання продукту скасовано.");});
  addProductModal?.addEventListener("click",e=>{if(e.target===addProductModal){addProductModal.classList.remove("active");document.body.classList.remove("edit-modal-open");}});
  addProductSave?.addEventListener("click",()=>{
    const name=newProductName.value.trim(); if(!name)return newProductName.focus();
    const category=newProductCategory?.value||""; if(!category)return newProductCategory?.focus();
    saveUndoSnapshot(`Додавання продукту «${name}»`);
    products.push(normalizeProduct({
      id:createId("product"),name,
      kcal:newProductKcalNoData?.checked?0:newProductKcal.value,kcal_no_data:!!newProductKcalNoData?.checked,
      protein:newProductProteinNoData?.checked?0:newProductProtein.value,protein_no_data:!!newProductProteinNoData?.checked,
      fat:newProductFatNoData?.checked?0:newProductFat.value,fat_no_data:!!newProductFatNoData?.checked,
      carb:newProductCarbNoData?.checked?0:newProductCarb.value,carb_no_data:!!newProductCarbNoData?.checked,
      sugar:newProductSugarNoData?.checked?0:newProductSugar.value,sugar_no_data:!!newProductSugarNoData?.checked,
      salt:newProductSaltNoData?.checked?0:newProductSalt.value,salt_no_data:!!newProductSaltNoData?.checked,
      fiber:newProductFiberNoData?.checked?0:newProductFiber.value,fiber_no_data:!!newProductFiberNoData?.checked,
      unit:"г",
      category,
      quick_weights:readQuickWeightInputs(newProductQuickWeights),
      full_name:newProductDescriptionNoData?.checked?"":newProductDescription.value.trim(),
      full_name_no_data:!!newProductDescriptionNoData?.checked,
      created_at:new Date().toISOString()
    }));
    saveProductsLocal();renderProducts(searchInput?.value||"");showButtonState(addProductSave,"Збережено","success",500);
    setTimeout(()=>{addProductModal.classList.remove("active");document.body.classList.remove("edit-modal-open");requestAnimationFrame(()=>showButtonState(addProductButton,"Продукт додано","success"));},260);
    logAction(`Додано продукт «${name}».`);
  });

  function openEditProductModal(product){
    editingProduct=product;
    editProductName.value=product.name;
    editProductKcal.value=productDisplayNumber(product,"kcal");setNoDataField(editProductKcal,editProductKcalNoData,product.kcal_no_data);
    editProductProtein.value=productDisplayNumber(product,"protein");setNoDataField(editProductProtein,editProductProteinNoData,product.protein_no_data);
    editProductFat.value=productDisplayNumber(product,"fat");setNoDataField(editProductFat,editProductFatNoData,product.fat_no_data);
    editProductCarb.value=productDisplayNumber(product,"carb");setNoDataField(editProductCarb,editProductCarbNoData,product.carb_no_data);
    editProductSugar.value=productDisplayNumber(product,"sugar");setNoDataField(editProductSugar,editProductSugarNoData,product.sugar_no_data);
    editProductSalt.value=productDisplayNumber(product,"salt");setNoDataField(editProductSalt,editProductSaltNoData,product.salt_no_data);
    editProductFiber.value=productDisplayNumber(product,"fiber");setNoDataField(editProductFiber,editProductFiberNoData,product.fiber_no_data);
    if(editProductCategory)editProductCategory.value=getProductCategory(product).id;
    fillQuickWeightInputs(editProductQuickWeights,product.quick_weights);
    editProductDescription.value=product.full_name||"";setNoDataField(editProductDescription,editProductDescriptionNoData,product.full_name_no_data,"");
    editProductModal.classList.add("active");document.body.classList.add("edit-modal-open");logAction(`Відкрито редагування продукту «${product.name}».`);setTimeout(()=>editProductName.focus(),50);
  }
  function closeEditProductModal(){editingProduct=null;editProductModal.classList.remove("active");document.body.classList.remove("edit-modal-open");}
  editProductCancel?.addEventListener("click",()=>{const n=editingProduct?.name||"продукту";showButtonState(editProductCancel,"Скасовано","error");logAction(`Редагування «${n}» скасовано.`);setTimeout(closeEditProductModal,400);});
  editProductModal?.addEventListener("click",e=>{if(e.target===editProductModal)closeEditProductModal();});
  editProductModal?.addEventListener("touchmove",e=>{if(e.target===editProductModal)e.preventDefault();},{passive:false});
  editProductSave?.addEventListener("click",()=>{
    if(!editingProduct)return;
    const name=editProductName.value.trim(); if(!name)return editProductName.focus();
    saveUndoSnapshot(`Редагування продукту «${editingProduct.name}»`);
    Object.assign(editingProduct,{
      name,
      kcal:editProductKcalNoData?.checked?0:number(editProductKcal.value),kcal_no_data:!!editProductKcalNoData?.checked,
      protein:editProductProteinNoData?.checked?0:number(editProductProtein.value),protein_no_data:!!editProductProteinNoData?.checked,
      fat:editProductFatNoData?.checked?0:number(editProductFat.value),fat_no_data:!!editProductFatNoData?.checked,
      carb:editProductCarbNoData?.checked?0:number(editProductCarb.value),carb_no_data:!!editProductCarbNoData?.checked,
      sugar:editProductSugarNoData?.checked?0:number(editProductSugar.value),sugar_no_data:!!editProductSugarNoData?.checked,
      salt:editProductSaltNoData?.checked?0:number(editProductSalt.value),salt_no_data:!!editProductSaltNoData?.checked,
      fiber:editProductFiberNoData?.checked?0:number(editProductFiber.value),fiber_no_data:!!editProductFiberNoData?.checked,
      category:editProductCategory?.value||getProductCategory(editingProduct).id,
      quick_weights:readQuickWeightInputs(editProductQuickWeights),
      display:{
        kcal:normalizeDisplayNumber(editProductKcal.value,number(editProductKcal.value)),
        protein:normalizeDisplayNumber(editProductProtein.value,number(editProductProtein.value)),
        fat:normalizeDisplayNumber(editProductFat.value,number(editProductFat.value)),
        carb:normalizeDisplayNumber(editProductCarb.value,number(editProductCarb.value)),
        sugar:normalizeDisplayNumber(editProductSugar.value,number(editProductSugar.value)),
        salt:normalizeDisplayNumber(editProductSalt.value,number(editProductSalt.value)),
        fiber:normalizeDisplayNumber(editProductFiber.value,number(editProductFiber.value))
      },
      full_name:editProductDescriptionNoData?.checked?"":editProductDescription.value.trim(),
      full_name_no_data:!!editProductDescriptionNoData?.checked
    });
    saveProductsLocal();renderProducts(searchInput?.value||"");
    showButtonState(editProductSave,"Збережено","success"); logAction(`Зміни продукту «${name}» збережено.`);
    setTimeout(closeEditProductModal,400);
  });

  const SORT_LABELS={
    categories:"за відділами",
    oldest:"за датою: від старіших до новіших",
    newest:"за датою: від новіших до старіших",
    list:"списком А–Я",
    random:"хаотично",
    initial:"у початковому порядку",
    manual:"у ручному порядку"
  };
  const SORT_BUTTONS={
    categories:sortCategories,
    oldest:sortOldest,
    newest:sortNewest,
    list:sortList,
    random:sortRandom,
    initial:sortInitial
  };
  function categoryById(id){
    return getAllCategories().find(category=>category.id===id)||null;
  }
  function renderCategoryOrderList(){
    if(!categoryOrderList)return;
    categoryOrderList.innerHTML="";
    const order=normalizeCategoryOrder(pendingCategoryOrder);
    pendingCategoryOrder=[...order];

    order.forEach((id,index)=>{
      const category=categoryById(id);
      if(!category)return;

      const row=document.createElement("div");
      row.className="category-order-row";
      row.dataset.category=id;

      const position=document.createElement("span");
      position.className="category-order-position";
      position.textContent=String(index+1);

      const label=document.createElement("span");
      label.className="category-order-label";
      label.textContent=category.label;

      const controls=document.createElement("div");
      controls.className="category-order-controls";

      const up=document.createElement("button");
      up.type="button";
      up.className="category-order-move";
      up.textContent="↑";
      up.title="Перемістити вище";
      up.disabled=index===0;

      const down=document.createElement("button");
      down.type="button";
      down.className="category-order-move";
      down.textContent="↓";
      down.title="Перемістити нижче";
      down.disabled=index===order.length-1;

      up.addEventListener("click",()=>{
        if(index<=0)return;
        showButtonState(up,"↑","success",140);
        setTimeout(()=>{
          [pendingCategoryOrder[index-1],pendingCategoryOrder[index]]=[pendingCategoryOrder[index],pendingCategoryOrder[index-1]];
          logAction(`Відділ «${category.label}» переміщено вище.`);
          renderCategoryOrderList();
        },140);
      });
      down.addEventListener("click",()=>{
        if(index>=order.length-1)return;
        showButtonState(down,"↓","success",140);
        setTimeout(()=>{
          [pendingCategoryOrder[index],pendingCategoryOrder[index+1]]=[pendingCategoryOrder[index+1],pendingCategoryOrder[index]];
          logAction(`Відділ «${category.label}» переміщено нижче.`);
          renderCategoryOrderList();
        },140);
      });

      controls.append(up,down);
      row.append(position,label,controls);
      categoryOrderList.append(row);
    });
  }
  function openCategoryOrderModal(){
    pendingCategoryOrder=getCategoryOrder();
    renderCategoryOrderList();
    sortProductsModal?.classList.remove("active");
    categoryOrderModal?.classList.add("active");
    document.body.classList.add("edit-modal-open");
    logAction("Відкрито налаштування порядку відділів.");
  }
  function closeCategoryOrderModal(returnToSort=false){
    categoryOrderModal?.classList.remove("active");
    pendingCategoryOrder=null;
    if(returnToSort){
      sortProductsModal?.classList.add("active");
      updateSortOptionState();
      document.body.classList.add("edit-modal-open");
    }else if(!deleteProductModal?.classList.contains("active")){
      document.body.classList.remove("edit-modal-open");
    }
  }
  sortCategoryOrder?.addEventListener("click",()=>{
    showButtonState(sortCategoryOrder,"Відкрито","success",500);
    setTimeout(openCategoryOrderModal,220);
  });
  categoryOrderReset?.addEventListener("click",()=>{
    pendingCategoryOrder=defaultCategoryOrder();
    renderCategoryOrderList();
    showButtonState(categoryOrderReset,"Скинуто","error",1000);
    logAction("Порядок відділів скинуто до початкового у вікні налаштування.");
  });
  categoryOrderCancel?.addEventListener("click",()=>{
    showButtonState(categoryOrderCancel,"Скасовано","error",500);
    logAction("Зміну порядку відділів скасовано.");
    setTimeout(()=>{closeCategoryOrderModal(true);requestAnimationFrame(()=>showButtonState(sortCategoryOrder,"Не змінено","error"));},260);
  });
  categoryOrderSave?.addEventListener("click",()=>{
    saveUndoSnapshot("Зміна порядку відділів");
    saveCategoryOrder(pendingCategoryOrder||defaultCategoryOrder());
    if(departmentsEnabled){
      currentSort="categories";
      localStorage.setItem(SORT_KEY,"categories");
    }
    renderProducts(searchInput?.value||"");
    if(deleteProductModal?.classList.contains("active"))renderDeleteProductList();
    showButtonState(categoryOrderSave,"Збережено","success",500);
    const outer=sortTarget==="delete"?deleteSortProducts:sortProductsButton;
    logAction(departmentsEnabled?"Порядок відділів збережено; сортування за відділами застосовано.":"Порядок відділів збережено; відділи залишаються вимкненими.");
    setTimeout(()=>{closeCategoryOrderModal(false);requestAnimationFrame(()=>showButtonState(outer,"Збережено","success"));},260);
  });
  categoryOrderModal?.addEventListener("click",e=>{
    if(e.target===categoryOrderModal){
      logAction("Налаштування порядку відділів закрито без збереження.");
      closeCategoryOrderModal(true);
    }
  });


  function updateSortOptionState(){
    Object.entries(SORT_BUTTONS).forEach(([mode,button])=>{
      if(!button)return;
      button.classList.toggle("sort-option-current",mode===currentSort);
    });
    if(sortCategories)sortCategories.disabled=!departmentsEnabled;
    if(sortDepartmentsToggle)sortDepartmentsToggle.checked=departmentsEnabled;
  }
  function closeSortModal(){
    sortProductsModal?.classList.remove("active");
    if(!deleteProductModal?.classList.contains("active"))document.body.classList.remove("edit-modal-open");
  }
  function openSortModal(target="blocks"){
    sortTarget=target;
    updateSortOptionState();
    sortProductsModal.classList.add("active");
    document.body.classList.add("edit-modal-open");
    logAction("Відкрито сортування продуктів.");
  }
  sortProductsButton?.addEventListener("click",()=>openSortModal("blocks"));
  deleteSortProducts?.addEventListener("click",()=>openSortModal("delete"));
  sortProductsCancel?.addEventListener("click",()=>{
    showButtonState(sortProductsCancel,"Скасовано","error",500);
    const b=sortTarget==="delete"?deleteSortProducts:sortProductsButton;
    logAction("Сортування продуктів скасовано.");
    setTimeout(()=>{closeSortModal();requestAnimationFrame(()=>showButtonState(b,"Не відсортовано","error"));},260);
  });
  sortProductsModal?.addEventListener("click",e=>{
    if(e.target===sortProductsModal){
      const b=sortTarget==="delete"?deleteSortProducts:sortProductsButton;
      logAction("Сортування продуктів закрито без змін.");
      closeSortModal();
      requestAnimationFrame(()=>showButtonState(b,"Не відсортовано","error"));
    }
  });
  function applySort(mode){
    if(!SORT_BUTTONS[mode])return;
    if(mode==="categories"&&!departmentsEnabled){
      showButtonState(sortCategories,"Відділи вимкнено","error");
      return;
    }
    saveUndoSnapshot("Сортування продуктів");
    currentSort=mode;
    localStorage.setItem(SORT_KEY,mode);
    if(mode==="random")localStorage.setItem(RANDOM_SORT_SEED_KEY,`${Date.now()}-${Math.random()}`);
    updateSortOptionState();

    const selectedSortButton=SORT_BUTTONS[mode];
    showButtonState(selectedSortButton,"Відсортовано","success",500);

    renderProducts(searchInput?.value||"");
    if(deleteProductModal.classList.contains("active"))renderDeleteProductList();

    const outer=sortTarget==="delete"?deleteSortProducts:sortProductsButton;
    logAction(`Продукти відсортовано ${SORT_LABELS[mode]}.`);
    setTimeout(()=>{closeSortModal();requestAnimationFrame(()=>showButtonState(outer,"Відсортовано","success"));},260);
  }
  function saveDepartmentsEnabled(value){
    departmentsEnabled=!!value;
    localStorage.setItem(DEPARTMENTS_ENABLED_KEY,departmentsEnabled?"1":"0");
    updateSortOptionState();
  }

  sortDepartmentsToggle?.addEventListener("change",()=>{
    const next=!!sortDepartmentsToggle.checked;
    saveUndoSnapshot(next?"Увімкнення відділів":"Вимкнення відділів");
    saveDepartmentsEnabled(next);
    currentSort=next?"categories":"initial";
    localStorage.setItem(SORT_KEY,currentSort);
    renderProducts(searchInput?.value||"");
    if(deleteProductModal?.classList.contains("active"))renderDeleteProductList();
    logAction(next?"Відділи увімкнено.":"Відділи вимкнено; сортування за відділами не застосовується.");
  });

  function renderCustomCategoryList(){
    if(!customCategoryList)return;

    const all=getAllCategories();
    const defaults=all.filter(category=>!category.custom);
    const custom=all.filter(category=>category.custom);
    customCategoryList.innerHTML="";

    function appendSection(title,categories,emptyText){
      const section=document.createElement("section");
      section.className="custom-category-section";

      const heading=document.createElement("div");
      heading.className="custom-category-section-title";
      heading.textContent=title;
      section.append(heading);

      const list=document.createElement("div");
      list.className="custom-category-section-list";

      if(!categories.length){
        const empty=document.createElement("div");
        empty.className="custom-category-empty";
        empty.textContent=emptyText;
        list.append(empty);
      }else{
        categories.forEach(category=>{
          const row=document.createElement("div");
          row.className="custom-category-row";

          const name=document.createElement("div");
          name.className="custom-category-name";
          name.textContent=category.label;

          const remove=document.createElement("button");
          remove.type="button";
          remove.className="custom-category-remove";
          remove.textContent="Видалити";

          remove.addEventListener("click",()=>{
            const ok=confirm(`Видалити відділ «${category.label}»? Самі продукти не видаляться.`);
            if(!ok){
              showButtonState(remove,"Скасовано","error");
              return;
            }

            saveUndoSnapshot(`Видалення відділу «${category.label}»`);
            products.forEach(product=>{
              if(String(product.category||"")===category.id)product.category="";
            });
            saveProductsLocal();

            if(category.custom){
              saveCustomCategories(getCustomCategories().filter(item=>item.id!==category.id));
            }else{
              saveDeletedDefaultCategoryIds([...getDeletedDefaultCategoryIds(),category.id]);
            }

            saveCategoryOrder(getCategoryOrder().filter(id=>id!==category.id));
            populateProductCategorySelects();
            renderCustomCategoryList();
            renderCategoryOrderList();
            renderProducts(searchInput?.value||"");
            showButtonState(remove,"Видалено","success");
            logAction(`Відділ «${category.label}» видалено.`);
          });

          row.append(name,remove);
          list.append(row);
        });
      }

      section.append(list);
      customCategoryList.append(section);
    }

    appendSection(
      "Власні відділи",
      custom,
      "Власних відділів ще немає."
    );
    appendSection(
      "Відділи за замовчуванням",
      defaults,
      "Усі відділи за замовчуванням видалено."
    );
  }

  function openCustomCategoryModal(){
    sortProductsModal?.classList.remove("active");
    renderCustomCategoryList();
    if(customCategoryName)customCategoryName.value="";
    customCategoryModal?.classList.add("active");
    document.body.classList.add("edit-modal-open");
    setTimeout(()=>customCategoryName?.focus(),50);
    logAction("Відкрито налаштування власних відділів.");
  }

  function closeCustomCategoryModal(returnToSort=true){
    customCategoryModal?.classList.remove("active");
    if(returnToSort){
      sortProductsModal?.classList.add("active");
      updateSortOptionState();
      document.body.classList.add("edit-modal-open");
    }else if(!deleteProductModal?.classList.contains("active")){
      document.body.classList.remove("edit-modal-open");
    }
  }

  sortCustomCategory?.addEventListener("click",openCustomCategoryModal);
  customCategoryAdd?.addEventListener("click",()=>{
    const label=String(customCategoryName?.value||"").trim().replace(/\s+/g," ").slice(0,40);
    if(!label){
      showButtonState(customCategoryAdd,"Вкажіть назву","error");
      customCategoryName?.focus();
      return;
    }
    const duplicate=getAllCategories().some(category=>normalizeCategorySearch(category.label)===normalizeCategorySearch(label));
    if(duplicate){showButtonState(customCategoryAdd,"Вже існує","error");return;}
    saveUndoSnapshot(`Створення відділу «${label}»`);
    const custom=getCustomCategories();
    const created={id:createCustomCategoryId(),label};
    custom.push(created);
    saveCustomCategories(custom);
    saveCategoryOrder([...getCategoryOrder(),created.id]);
    populateProductCategorySelects();
    renderCustomCategoryList();
    if(customCategoryName)customCategoryName.value="";
    showButtonState(customCategoryAdd,"Додано","success");
    logAction(`Створено власний відділ «${label}».`);
  });
  customCategoryName?.addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();customCategoryAdd?.click();}});
  customCategoryClose?.addEventListener("click",()=>{
    showButtonState(customCategoryClose,"Закрито","error");
    setTimeout(()=>closeCustomCategoryModal(true),260);
  });
  customCategoryModal?.addEventListener("click",event=>{if(event.target===customCategoryModal)closeCustomCategoryModal(true);});

  sortCategories?.addEventListener("click",()=>applySort("categories"));
  sortOldest?.addEventListener("click",()=>applySort("oldest"));
  sortNewest?.addEventListener("click",()=>applySort("newest"));
  sortList?.addEventListener("click",()=>applySort("list"));
  sortRandom?.addEventListener("click",()=>applySort("random"));
  sortInitial?.addEventListener("click",()=>applySort("initial"));

  deleteProductButton?.addEventListener("click",()=>{renderDeleteProductList();deleteProductModal.classList.add("active");document.body.classList.add("edit-modal-open");logAction("Відкрито видалення продукту.");});
  [deleteProductCancelTop,deleteProductCancelBottom].forEach(b=>b?.addEventListener("click",()=>{showButtonState(b,"Скасовано","error",500);setTimeout(()=>{deleteProductModal.classList.remove("active");document.body.classList.remove("edit-modal-open");requestAnimationFrame(()=>showButtonState(deleteProductButton,"Продукт не видалено","error"));},260);logAction("Видалення продукту скасовано.");}));
  deleteProductModal?.addEventListener("click",e=>{if(e.target===deleteProductModal){deleteProductModal.classList.remove("active");document.body.classList.remove("edit-modal-open");}});
  function renderDeleteProductList(){
    deleteProductList.innerHTML="";
    const list=getSortedProducts();
    if(!list.length){deleteProductList.innerHTML='<div class="delete-product-empty">База продуктів порожня.</div>';return;}
    list.forEach(product=>{
      const item=document.createElement("div");item.className="delete-product-item";
      const name=document.createElement("div");name.className="delete-product-item-name";name.textContent=product.name;
      const button=document.createElement("button");button.className="delete-product-item-button";button.textContent="Видалити";
      button.addEventListener("click",()=>{
        if(!confirm(`Видалити продукт "${product.name}"?`)){
          showButtonState(button,"Скасовано","error",1000);
          showButtonState(deleteProductButton,"Продукт не видалено","error",1500);
          logAction(`Видалення продукту «${product.name}» скасовано.`);
          return;
        }
        saveUndoSnapshot(`Видалення продукту «${product.name}»`);
        products=products.filter(p=>p.id!==product.id);saveProductsLocal();renderProducts(searchInput?.value||"");renderDeleteProductList();
        showButtonState(deleteProductButton,"Продукт видалено","success",1500); logAction(`Видалено продукт «${product.name}».`);
      });
      item.append(name,button);deleteProductList.append(item);
    });
  }

  function productById(id){
    return products.find(product=>product.id===id)||null;
  }
  function renderProductOrderList(){
    if(!productOrderList)return;
    productOrderList.innerHTML="";
    const order=Array.isArray(pendingProductOrder)?pendingProductOrder:[];
    if(!order.length){
      productOrderList.innerHTML='<div class="product-order-empty">База продуктів порожня.</div>';
      return;
    }

    order.forEach((id,index)=>{
      const product=productById(id);
      if(!product)return;

      const row=document.createElement("div");
      row.className="product-order-row";
      row.dataset.id=id;

      const position=document.createElement("span");
      position.className="product-order-position";
      position.textContent=String(index+1);

      const name=document.createElement("span");
      name.className="product-order-name";
      name.textContent=product.name;

      const controls=document.createElement("div");
      controls.className="product-order-controls";

      const up=document.createElement("button");
      up.type="button";
      up.className="product-order-move";
      up.textContent="↑";
      up.title="Перемістити вище";
      up.disabled=index===0;

      const down=document.createElement("button");
      down.type="button";
      down.className="product-order-move";
      down.textContent="↓";
      down.title="Перемістити нижче";
      down.disabled=index===order.length-1;

      up.addEventListener("click",()=>{
        if(index<=0)return;
        showButtonState(up,"↑","success",140);
        setTimeout(()=>{
          [pendingProductOrder[index-1],pendingProductOrder[index]]=[pendingProductOrder[index],pendingProductOrder[index-1]];
          logAction(`Продукт «${product.name}» переміщено вище у вікні зміни розташування.`);
          renderProductOrderList();
        },140);
      });
      down.addEventListener("click",()=>{
        if(index>=order.length-1)return;
        showButtonState(down,"↓","success",140);
        setTimeout(()=>{
          [pendingProductOrder[index],pendingProductOrder[index+1]]=[pendingProductOrder[index+1],pendingProductOrder[index]];
          logAction(`Продукт «${product.name}» переміщено нижче у вікні зміни розташування.`);
          renderProductOrderList();
        },140);
      });

      controls.append(up,down);
      row.append(position,name,controls);
      productOrderList.append(row);
    });
  }
  function openProductOrderModal(){
    productOrderOriginal=products.map(product=>product.id);
    pendingProductOrder=[...productOrderOriginal];
    renderProductOrderList();
    productOrderModal?.classList.add("active");
    document.body.classList.add("edit-modal-open");
    logAction("Відкрито зміну розташування продуктів.");
  }
  function closeProductOrderModal(){
    productOrderModal?.classList.remove("active");
    pendingProductOrder=null;
    productOrderOriginal=null;
    document.body.classList.remove("edit-modal-open");
  }
  reorderProductsButton?.addEventListener("click",()=>{
    if(!products.length){
      showButtonState(reorderProductsButton,"Немає продуктів","error",1500);
      logAction("Зміну розташування продуктів не відкрито: база порожня.");
      return;
    }
    openProductOrderModal();
  });
  function getInitialProductOrder(){
    return products
      .map((product,index)=>({product,index}))
      .sort((a,b)=>{
        const at=Date.parse(a.product?.created_at||"");
        const bt=Date.parse(b.product?.created_at||"");
        const av=Number.isFinite(at)?at:0;
        const bv=Number.isFinite(bt)?bt:0;
        return av-bv||a.index-b.index;
      })
      .map(entry=>entry.product.id);
  }
  productOrderReset?.addEventListener("click",()=>{
    pendingProductOrder=getInitialProductOrder();
    renderProductOrderList();
    showButtonState(productOrderReset,"Скинуто","error",1000);
    logAction("Порядок продуктів у вікні зміни розташування скинуто до початкового порядку додавання.");
  });
  productOrderCancel?.addEventListener("click",()=>{
    showButtonState(productOrderCancel,"Скасовано","error",500);
    logAction("Зміну розташування продуктів скасовано.");
    setTimeout(()=>{closeProductOrderModal();requestAnimationFrame(()=>showButtonState(reorderProductsButton,"Не змінено","error"));},260);
  });
  productOrderSave?.addEventListener("click",()=>{
    const next=Array.isArray(pendingProductOrder)?pendingProductOrder:[];
    const original=Array.isArray(productOrderOriginal)?productOrderOriginal:[];
    const changed=next.length===original.length&&next.some((id,index)=>id!==original[index]);

    if(changed){
      saveUndoSnapshot("Зміна розташування продуктів");
      const byId=new Map(products.map(product=>[product.id,product]));
      products=next.map(id=>byId.get(id)).filter(Boolean);
      currentSort="manual";
      localStorage.setItem(SORT_KEY,"manual");
      saveProductsLocal();
      renderProducts(searchInput?.value||"");
      showButtonState(productOrderSave,"Збережено","success",500);
      logAction("Розташування продуктів змінено та збережено.");
    }else{
      showButtonState(productOrderSave,"Не змінено","error",500);
      logAction("Зміну розташування продуктів завершено без змін.");
    }
    const reorderResultChanged=changed;
    setTimeout(()=>{closeProductOrderModal();requestAnimationFrame(()=>showButtonState(reorderProductsButton,reorderResultChanged?"Розташування змінено":"Розташування не змінено",reorderResultChanged?"success":"error"));},260);
  });
  productOrderModal?.addEventListener("click",e=>{
    if(e.target===productOrderModal){
      logAction("Вікно зміни розташування продуктів закрито без збереження.");
      closeProductOrderModal();
      requestAnimationFrame(()=>showButtonState(reorderProductsButton,"Не змінено","error"));
    }
  });
  function updateReorderState(){
    if(!grid)return;
    grid.classList.remove("reorder-mode");
    grid.querySelectorAll(".food-card").forEach(card=>{card.draggable=false;});
  }
  function attachDragEvents(){}

  function normalizeDailyGoal(value){
    const source=value&&typeof value==="object"?value:{};
    return {
      enabled:!!source.enabled,
      kcal:Math.max(0,number(source.kcal)),
      protein:Math.max(0,number(source.protein)),
      fat:Math.max(0,number(source.fat)),
      carb:Math.max(0,number(source.carb)),
      sugar:Math.max(0,number(source.sugar)),
      salt:Math.max(0,number(source.salt)),
      fiber:Math.max(0,number(source.fiber))
    };
  }
  function hasDailyGoalData(value){
    const goal=normalizeDailyGoal(value);
    return ["kcal","protein","fat","carb","sugar","salt","fiber"].some(key=>goal[key]>0);
  }

  function peekExportVersion(){
    const fingerprint=exportFingerprint();
    const previous=localStorage.getItem(EXPORT_FINGERPRINT_KEY);
    let version=Math.max(0,parseInt(localStorage.getItem(EXPORT_VERSION_KEY)||"0",10)||0);
    if(previous!==fingerprint)version+=1;
    return Math.max(1,version);
  }
  function exportScopeLabel(scope){
    if(scope==="blocks")return "тільки КБЖВ-блоки";
    if(scope==="archive")return "тільки КБЖВ-історію";
    if(scope==="goal")return "тільки денну ціль";
    if(scope==="profile")return "тільки дані профілю";
    return hasDailyGoalData(dailyGoal)?"КБЖВ-блоки, історію, денну ціль та профіль":"КБЖВ-блоки, історію та профіль";
  }
  function updateExportScopeUI(){
    const hasGoal=hasDailyGoalData(dailyGoal);
    exportScopeButtons.forEach(button=>{
      const disabled=button.dataset.scope==="goal"&&!hasGoal;
      button.disabled=disabled;
      button.classList.toggle("transfer-scope-selected",!disabled&&button.dataset.scope===exportScope);
    });

    if(exportPreviewProducts){
      exportPreviewProducts.textContent=(exportScope==="archive"||exportScope==="goal"||exportScope==="profile")?"Не експортується":String(products.length);
    }
    if(exportPreviewArchive){
      exportPreviewArchive.textContent=(exportScope==="blocks"||exportScope==="goal"||exportScope==="profile")?"Не експортується":String(archiveItems.length);
    }
    if(exportPreviewGoal){
      exportPreviewGoal.textContent=!hasGoal?"Не задана":(exportScope==="blocks"||exportScope==="archive"||exportScope==="profile")?"Не експортується":"Задана";
    }
    if(exportPreviewProfile){
      exportPreviewProfile.textContent=(exportScope==="blocks"||exportScope==="archive"||exportScope==="goal")?"Не експортується":(hasProfileData()?"Задані":"Порожні");
    }
  }
  function closeExportPreview(){
    exportPreviewModal?.classList.remove("active");
    document.body.classList.remove("edit-modal-open");
    pendingExport=null;
  }
  function performPendingExport(){
    if(!pendingExport)return;
    const hasGoal=hasDailyGoalData(dailyGoal);
    if(exportScope==="goal"&&!hasGoal)return;

    const version=getExportVersion();
    const exportedAt=pendingExport.exportedAt;
    const data={version,exported_at:exportedAt,export_scope:exportScope};

    if(exportScope==="all"||exportScope==="blocks"){
      data.products=products.map((p,i)=>normalizeProduct(p,i));
      data.category_order=getCategoryOrder();
      data.custom_categories=getCustomCategories().map(({id,label})=>({id,label}));
      data.deleted_default_categories=getDeletedDefaultCategoryIds();
      data.departments_enabled=departmentsEnabled;
    }
    if(exportScope==="all"||exportScope==="archive")data.archive=archiveItems;
    if((exportScope==="all"&&hasGoal)||exportScope==="goal")data.daily_goal=normalizeDailyGoal(dailyGoal);
    if(exportScope==="all"||exportScope==="profile")data.profile=normalizeProfile(profileData);
    if(exportScope==="all")data.calculator_quick_presets=normalizeQuickPresets(calculatorQuickPresets);

    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    const suffix=exportScope==="blocks"?"-blocks":exportScope==="archive"?"-archive":exportScope==="goal"?"-daily-goal":exportScope==="profile"?"-profile":"";
    a.href=url;a.download=`version-${version}${suffix}.json`;
    document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);

    localStorage.setItem(LAST_EXPORT_KEY,new Date().toISOString());
    updateSiteDataCounts();
    closeExportPreview();
    showButtonState(exportButton,"Експортовано","success",1800);
    logAction(`Експортовано version-${version}: ${exportScopeLabel(exportScope)}.`);
  }
  exportButton?.addEventListener("click",()=>{
    const version=peekExportVersion(),exportedAt=new Date().toISOString();
    exportScope="all";
    pendingExport={version,exportedAt};
    if(exportPreviewVersion)exportPreviewVersion.textContent=String(version);
    if(exportPreviewDate)exportPreviewDate.textContent=formatImportDate(exportedAt);
    updateExportScopeUI();
    exportPreviewModal?.classList.add("active");
    document.body.classList.add("edit-modal-open");
    logAction(`Вікно перевірки експорту відкрито: ${products.length} продуктів, ${archiveItems.length} записів архіву${hasDailyGoalData(dailyGoal)?", денна ціль задана":", денна ціль не задана"}, version-${version}. Очікується підтвердження.`);
  });
  exportScopeButtons.forEach(button=>button.addEventListener("click",()=>{
    if(button.disabled)return;
    exportScope=button.dataset.scope||"all";
    updateExportScopeUI();
    logAction(`Для експорту вибрано: ${exportScopeLabel(exportScope)}.`);
  }));
  exportPreviewCancel?.addEventListener("click",()=>{
    showButtonState(exportPreviewCancel,"Скасовано","error",550);
    logAction("Експорт скасовано після перевірки.");
    setTimeout(()=>{closeExportPreview();requestAnimationFrame(()=>showButtonState(exportButton,"Не експортовано","error"));},260);
  });
  exportPreviewConfirm?.addEventListener("click",()=>{
    showButtonState(exportPreviewConfirm,"Експортовано","success",700);
    setTimeout(performPendingExport,260);
  });
  exportPreviewModal?.addEventListener("click",e=>{if(e.target===exportPreviewModal)exportPreviewCancel?.click();});

  let importDialogOpened=false;
  importButton?.addEventListener("click",()=>{importDialogOpened=true;importFile?.click();});
  window.addEventListener("focus",()=>{
    if(!importDialogOpened)return;
    setTimeout(()=>{
      if(importFile && (!importFile.files || importFile.files.length===0)){showButtonState(importButton,"Не імпортовано","error",1500);logAction("Імпорт бази скасовано.");}
      importDialogOpened=false;
    },200);
  });
  function formatImportDate(value){
    if(!value)return "Не вказано";const d=new Date(value);if(Number.isNaN(d.getTime()))return String(value);
    return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  }
  function stableComparable(value){
    if(Array.isArray(value))return value.map(stableComparable);
    if(value&&typeof value==="object"){const out={};Object.keys(value).sort().forEach(k=>{if(!["created_at","updated_at"].includes(k))out[k]=stableComparable(value[k]);});return out;}
    return value;
  }
  function compareImportCollections(current,incoming,keyFn,normalizeFn=v=>v){
    const currentMap=new Map(current.map((item,i)=>[keyFn(item,i),normalizeFn(item,i)]));
    const incomingMap=new Map(incoming.map((item,i)=>[keyFn(item,i),normalizeFn(item,i)]));
    let added=0,changed=0,removed=0;
    incomingMap.forEach((value,key)=>{if(!currentMap.has(key))added++;else if(JSON.stringify(stableComparable(currentMap.get(key)))!==JSON.stringify(stableComparable(value)))changed++;});
    currentMap.forEach((_,key)=>{if(!incomingMap.has(key))removed++;});
    return {added,changed,removed};
  }
  function formatImportDiff(diff){return `+${diff.added} додано / ~${diff.changed} змінено / −${diff.removed} видалено`;}
  function productImportKey(item,index){const id=String(item?.id||"").trim();if(id)return `id:${id}`;return `name:${String(item?.name||"").trim().toLowerCase()||index}`;}
  function normalizedProductName(item){return String(item?.name||"").trim().toLocaleLowerCase("uk-UA").replace(/\s+/g," ");}
  function getOnlyNewImportedProducts(current,incoming){
    const ids=new Set(current.map(item=>String(item?.id||"").trim()).filter(Boolean));
    const names=new Set(current.map(normalizedProductName).filter(Boolean));
    const result=[];
    incoming.forEach(item=>{
      const id=String(item?.id||"").trim();
      const name=normalizedProductName(item);
      if((id&&ids.has(id))||(name&&names.has(name)))return;
      result.push(item);
      if(id)ids.add(id);
      if(name)names.add(name);
    });
    return result;
  }
  function archiveImportKey(item,index){const id=String(item?.id||"").trim();if(id)return `id:${id}`;return `fallback:${String(item?.date||"")}|${String(item?.text||"")}|${index}`;}
  function archiveImportSignature(item){
    const date=String(item?.date||"").trim();
    const text=String(item?.text||"").trim().replace(/\s+/g," ");
    return `${date}|${text}`;
  }
  function getOnlyNewImportedArchive(current,incoming){
    const ids=new Set(current.map(item=>String(item?.id||"").trim()).filter(Boolean));
    const signatures=new Set(current.map(archiveImportSignature).filter(Boolean));
    const result=[];
    incoming.forEach(item=>{
      const id=String(item?.id||"").trim();
      const signature=archiveImportSignature(item);
      if((id&&ids.has(id))||(signature&&signatures.has(signature)))return;
      result.push(item);
      if(id)ids.add(id);
      if(signature)signatures.add(signature);
    });
    return result;
  }
  function updateImportScopeUI(){
    if(!pendingImport)return;
    const {hasProducts,hasArchive,hasGoal,hasProfile,normalized,importedArchive,productDiff,archiveDiff}=pendingImport;
    const canAll=hasProducts&&hasArchive;

    importScopeButtons.forEach(button=>{
      const scope=button.dataset.scope;
      const disabled=(scope==="all"&&!canAll)||(scope==="blocks"&&!hasProducts)||(scope==="new-blocks"&&!hasProducts)||(scope==="archive"&&!hasArchive)||(scope==="new-archive"&&!hasArchive)||(scope==="goal"&&!hasGoal)||(scope==="profile"&&!hasProfile);
      button.disabled=disabled;
      button.classList.toggle("transfer-scope-selected",!disabled&&scope===importScope);
    });

    if(importPreviewProducts)importPreviewProducts.textContent=hasProducts?String(normalized.length):"Не містить блоків";
    if(importPreviewArchive)importPreviewArchive.textContent=hasArchive?String(importedArchive.length):"Не містить архіву";
    if(importPreviewGoal)importPreviewGoal.textContent=hasGoal?"Задана":"Не містить денної цілі";
    if(importPreviewProfile)importPreviewProfile.textContent=hasProfile?"Містить дані профілю":"Не містить профілю";

    if(importPreviewProductsDiff){
      if(!hasProducts)importPreviewProductsDiff.textContent="Недоступно";
      else if(importScope==="archive"||importScope==="new-archive"||importScope==="goal"||importScope==="profile")importPreviewProductsDiff.textContent="Не імпортується";
      else if(importScope==="new-blocks"){
        const onlyNew=getOnlyNewImportedProducts(products,normalized);
        importPreviewProductsDiff.textContent=`+${onlyNew.length} нових / ${normalized.length-onlyNew.length} вже є`;
      }else importPreviewProductsDiff.textContent=formatImportDiff(productDiff);
    }
    if(importPreviewArchiveDiff){
      if(!hasArchive)importPreviewArchiveDiff.textContent="Недоступно";
      else if(importScope==="blocks"||importScope==="new-blocks"||importScope==="goal"||importScope==="profile")importPreviewArchiveDiff.textContent="Не імпортується";
      else if(importScope==="new-archive"){
        const onlyNewArchive=getOnlyNewImportedArchive(archiveItems,importedArchive);
        importPreviewArchiveDiff.textContent=`+${onlyNewArchive.length} нових / ${importedArchive.length-onlyNewArchive.length} вже є`;
      }else importPreviewArchiveDiff.textContent=formatImportDiff(archiveDiff);
    }
    if(importPreviewConfirm){
      const label=(importScope==="new-blocks"||importScope==="new-archive")?"Додати":"Імпортувати";
      importPreviewConfirm.textContent=label;
      importPreviewConfirm.dataset.originalText=label;
    }
  }
  function closeImportPreview(){
    importPreviewModal?.classList.remove("active");
    document.body.classList.remove("edit-modal-open");
    pendingImport=null;
  }
  function applyPendingImport(){
    if(!pendingImport)return;
    const {parsed,normalized,hasProducts,hasArchive,hasGoal,hasProfile,importedArchive,importedGoal,importedProfile,importedQuickPresets,importedCategoryOrder,importedCustomCategories,importedDeletedDefaultCategories,importedDepartmentsEnabled}=pendingImport;
    const appendOnlyNew=importScope==="new-blocks";
    const appendOnlyNewArchive=importScope==="new-archive";
    const importProducts=importScope==="all"||importScope==="blocks"||appendOnlyNew;
    const importArchive=importScope==="all"||importScope==="archive"||appendOnlyNewArchive;
    const importGoal=(importScope==="goal")||(importScope==="all"&&hasGoal);
    const importProfile=(importScope==="profile")||(importScope==="all"&&hasProfile);
    const importQuickPresets=importScope==="all"&&Array.isArray(importedQuickPresets);

    if((importProducts&&!hasProducts)||(importArchive&&!hasArchive)||(importGoal&&!hasGoal)||(importProfile&&!hasProfile))return;

    const newProducts=appendOnlyNew?getOnlyNewImportedProducts(products,normalized):[];
    const newArchiveItems=appendOnlyNewArchive?getOnlyNewImportedArchive(archiveItems,importedArchive):[];

    if(appendOnlyNew&&!newProducts.length){
      closeImportPreview();
      showButtonState(importButton,"Нових немає","info");
      logAction("Імпорт нових КБЖВ-блоків завершено: усі продукти з файла вже є в базі.");
      if(importFile)importFile.value="";
      importDialogOpened=false;
      return;
    }
    if(appendOnlyNewArchive&&!newArchiveItems.length){
      closeImportPreview();
      showButtonState(importButton,"Нової історії немає","info");
      logAction("Імпорт нової КБЖВ-історії завершено: усі записи з файла вже є в архіві.");
      if(importFile)importFile.value="";
      importDialogOpened=false;
      return;
    }

    const description=importScope==="blocks"?"Імпорт КБЖВ-блоків":
      appendOnlyNew?"Додавання нових КБЖВ-блоків":
      importScope==="archive"?"Імпорт КБЖВ-архіву":
      appendOnlyNewArchive?"Додавання нової КБЖВ-історії":
      importScope==="goal"?"Імпорт денної цілі КБЖВ":
      importScope==="profile"?"Імпорт даних профілю":
      "Імпорт бази, архіву та доступних додаткових даних";
    saveUndoSnapshot(description);

    if(importProducts){
      products=appendOnlyNew?[...products,...newProducts]:normalized;

      if(appendOnlyNew){
        if(Array.isArray(importedCustomCategories)){
          const existing=getCustomCategories();
          const ids=new Set(existing.map(item=>item.id));
          const labels=new Set(existing.map(item=>normalizeCategorySearch(item.label)));
          const merged=[...existing];
          importedCustomCategories.forEach(item=>{
            if(ids.has(item.id)||labels.has(normalizeCategorySearch(item.label)))return;
            merged.push(item);ids.add(item.id);labels.add(normalizeCategorySearch(item.label));
          });
          saveCustomCategories(merged);
          if(Array.isArray(importedCategoryOrder))saveCategoryOrder([...getCategoryOrder(),...importedCategoryOrder]);
        }
      }else{
        if(Array.isArray(importedCustomCategories))saveCustomCategories(importedCustomCategories);
        if(Array.isArray(importedDeletedDefaultCategories))saveDeletedDefaultCategoryIds(importedDeletedDefaultCategories);
        populateProductCategorySelects();
        if(Array.isArray(importedCategoryOrder))saveCategoryOrder(importedCategoryOrder);
        if(importedDepartmentsEnabled!==null)saveDepartmentsEnabled(importedDepartmentsEnabled);
        if(departmentsEnabled&&Array.isArray(importedCategoryOrder))currentSort="categories";
        else if(!departmentsEnabled&&currentSort==="categories")currentSort="initial";
        localStorage.setItem(SORT_KEY,currentSort);
      }

      populateProductCategorySelects();
      saveProductsLocal();
    }
    if(importArchive){
      archiveItems=appendOnlyNewArchive?[...archiveItems,...newArchiveItems]:importedArchive;
      saveArchiveLocal();
    }
    if(importGoal){
      dailyGoal=normalizeDailyGoal(importedGoal);
      localStorage.setItem(DAILY_GOAL_KEY,JSON.stringify(dailyGoal));
      dailyGoalSettingsOpen=false;
      for(const key of Object.keys(goalInputs))if(goalInputs[key])goalInputs[key].value=dailyGoal[key]||"";
      renderDailyGoal();
    }
    if(importProfile){
      profileData=normalizeProfile(importedProfile);
      saveProfileLocal();
    }
    if(importQuickPresets){
      calculatorQuickPresets=normalizeQuickPresets(importedQuickPresets);
      saveCalculatorQuickPresets();
    }

    // Preserve the historical version only when the complete database was imported.
    if(importScope==="all"&&hasProducts&&hasArchive&&!Array.isArray(parsed)&&Number.isFinite(Number(parsed.version))){
      localStorage.setItem(EXPORT_VERSION_KEY,String(Math.max(1,Number(parsed.version))));
      localStorage.setItem(EXPORT_FINGERPRINT_KEY,exportFingerprint());
    }

    renderProducts(searchInput?.value||"");
    renderArchive();
    renderStatistics();
    updateSiteDataCounts();
    localStorage.setItem(LAST_IMPORT_KEY,new Date().toISOString());
    updateSiteDataCounts();

    const importedParts=[];
    if(importProducts)importedParts.push(appendOnlyNew?`${newProducts.length} нових КБЖВ-блоків`:`${products.length} КБЖВ-блоків${Array.isArray(importedCategoryOrder)?" + налаштування відділів":""}`);
    if(importArchive)importedParts.push(appendOnlyNewArchive?`${newArchiveItems.length} нових записів КБЖВ-історії`:`${archiveItems.length} записів КБЖВ-архіву`);
    if(importGoal)importedParts.push("денну ціль");
    if(importProfile)importedParts.push("дані профілю");
    if(importQuickPresets)importedParts.push("швидкі КБЖВ");
    closeImportPreview();
    showButtonState(importButton,"Імпортовано","success",1500);
    logAction(`Імпортовано: ${importedParts.join(", ")}.`);
    if(importFile)importFile.value="";
    importDialogOpened=false;
  }
  importPreviewCancel?.addEventListener("click",()=>{
    closeImportPreview();
    if(importFile)importFile.value="";
    importDialogOpened=false;
    showButtonState(importButton,"Не імпортовано","error",1500);
    showButtonState(importPreviewCancel,"Скасовано","error",1000);
    logAction("Імпорт скасовано після перевірки файла.");
  });
  importScopeButtons.forEach(button=>button.addEventListener("click",()=>{
    if(button.disabled)return;
    importScope=button.dataset.scope||"all";
    updateImportScopeUI();
    const importLabel=importScope==="blocks"?"тільки КБЖВ-блоки":importScope==="new-blocks"?"додати тільки нові КБЖВ-блоки":importScope==="archive"?"тільки КБЖВ-історію":importScope==="new-archive"?"додати тільки нову КБЖВ-історію":importScope==="goal"?"тільки денну ціль":importScope==="profile"?"тільки дані профілю":"усі доступні дані";
    logAction(`Для імпорту вибрано: ${importLabel}.`);
  }));
  importPreviewConfirm?.addEventListener("click",()=>{
    showButtonState(importPreviewConfirm,(importScope==="new-blocks"||importScope==="new-archive")?"Додано":"Імпортовано","success",700);
    setTimeout(applyPendingImport,260);
  });
  importPreviewModal?.addEventListener("click",e=>{if(e.target===importPreviewModal)importPreviewCancel?.click();});
  importFile?.addEventListener("change",async()=>{
    const file=importFile.files?.[0];if(!file)return;
    try{
      const parsed=JSON.parse(await file.text());

      const isOldArray=Array.isArray(parsed);
      const hasProducts=isOldArray||(!isOldArray&&Array.isArray(parsed.products));
      const hasArchive=!isOldArray&&Array.isArray(parsed.archive);
      const hasGoal=!isOldArray&&parsed.daily_goal&&typeof parsed.daily_goal==="object";
      const hasProfile=!isOldArray&&parsed.profile&&typeof parsed.profile==="object"&&!Array.isArray(parsed.profile);

      if(!hasProducts&&!hasArchive&&!hasGoal&&!hasProfile)throw new Error("Невірний формат");

      const rawProducts=hasProducts?(isOldArray?parsed:parsed.products):[];
      const normalized=hasProducts?rawProducts.map((p,i)=>normalizeProduct(p,i)).filter(p=>p.name):[];
      const importedArchive=hasArchive?parsed.archive:[];
      const importedGoal=hasGoal?normalizeDailyGoal(parsed.daily_goal):null;
      const importedProfile=hasProfile?normalizeProfile(parsed.profile):null;
      const importedQuickPresets=(!isOldArray&&Array.isArray(parsed.calculator_quick_presets))?normalizeQuickPresets(parsed.calculator_quick_presets):null;
      const importedCategoryOrder=(!isOldArray&&Array.isArray(parsed.category_order))?[...parsed.category_order]:null;
      const importedCustomCategories=(!isOldArray&&Array.isArray(parsed.custom_categories))?parsed.custom_categories.map(normalizeCustomCategoryItem).filter(Boolean):null;
      const importedDeletedDefaultCategories=(!isOldArray&&Array.isArray(parsed.deleted_default_categories))?[...parsed.deleted_default_categories]:null;
      const importedDepartmentsEnabled=(!isOldArray&&typeof parsed.departments_enabled==="boolean")?parsed.departments_enabled:null;

      const productDiff=hasProducts?compareImportCollections(products,rawProducts,productImportKey,(item,i)=>normalizeProduct(item,i)):null;
      const archiveDiff=hasArchive?compareImportCollections(archiveItems,importedArchive,archiveImportKey,item=>item):null;

      pendingImport={parsed,normalized,hasProducts,hasArchive,hasGoal,hasProfile,importedArchive,importedGoal,importedProfile,importedQuickPresets,importedCategoryOrder,importedCustomCategories,importedDeletedDefaultCategories,importedDepartmentsEnabled,productDiff,archiveDiff};

      importScope=hasProducts&&hasArchive?"all":hasProducts?"blocks":hasArchive?"archive":hasGoal?"goal":"profile";

      if(importPreviewVersion)importPreviewVersion.textContent=!isOldArray&&parsed.version!=null?String(parsed.version):"Не вказано";
      if(importPreviewDate)importPreviewDate.textContent=!isOldArray?formatImportDate(parsed.exported_at):"Не вказано";
      updateImportScopeUI();

      importPreviewModal?.classList.add("active");
      document.body.classList.add("edit-modal-open");

      const fileContents=[
        hasProducts?`${normalized.length} блоків`:null,
        hasArchive?`${importedArchive.length} записів архіву`:null,
        hasGoal?"денна ціль":null,
        hasProfile?"дані профілю":null,
        Array.isArray(importedQuickPresets)&&importedQuickPresets.length?`${importedQuickPresets.length} швидких КБЖВ`:null
      ].filter(Boolean).join(", ");
      logAction(`Файл імпорту перевірено: ${fileContents}. Очікується вибір типу імпорту та підтвердження.`);
    }catch(e){
      console.error(e);
      pendingImport=null;
      showButtonState(importButton,"Не імпортовано","error",1500);
      logAction("Помилка перевірки файла імпорту.");
      alert("Не вдалося імпортувати базу.\n\nПеревірте JSON-файл.");
      if(importFile)importFile.value="";
      importDialogOpened=false;
    }
  });

  function loadDailyGoal(){
    try{const raw=JSON.parse(localStorage.getItem(DAILY_GOAL_KEY)||"null");if(raw&&typeof raw==="object")dailyGoal={...dailyGoal,...raw};}catch(_){}
    
    for(const key of Object.keys(goalInputs))if(goalInputs[key])goalInputs[key].value=dailyGoal[key]||"";
    renderDailyGoal();
  }
  function renderDailyGoal(){
    if(dailyGoalContent)dailyGoalContent.classList.toggle("goal-disabled",!dailyGoal.enabled);
    if(dailyGoalToggle){
      dailyGoalToggle.textContent=dailyGoal.enabled?"Вимкнути":"Увімкнути";
      dailyGoalToggle.dataset.originalText=dailyGoalToggle.textContent;
      dailyGoalToggle.classList.toggle("is-enabled",!!dailyGoal.enabled);
    }
    if(dailyGoalSettings)dailyGoalSettings.classList.toggle("is-collapsed",!dailyGoalSettingsOpen);
    if(dailyGoalDetailsToggle){
      dailyGoalDetailsToggle.textContent=dailyGoalSettingsOpen?"Сховати налаштування":"Показати налаштування";
      dailyGoalDetailsToggle.dataset.originalText=dailyGoalDetailsToggle.textContent;
    }
    updateDailyGoalRemaining();
  }
  function getDailyGoalActual(){return {kcal:number(kcalElement?.textContent),protein:number(proteinElement?.textContent),fat:number(fatElement?.textContent),carb:number(carbElement?.textContent),sugar:number(sugarElement?.textContent),salt:number(saltElement?.textContent),fiber:number(fiberElement?.textContent)};}
  function updateDailyGoalRemaining(){
    if(!dailyGoal.enabled)return;
    const actual=getDailyGoalActual();
    for(const key of Object.keys(remainElements)){
      const el=remainElements[key];if(!el)continue;
      const target=number(dailyGoal[key]);
      const remaining=target-actual[key];
      el.textContent=formatNumber(remaining);
      el.classList.toggle("goal-exceeded",remaining<0);
      const fill=progressElements[key],label=progressLabels[key];
      if(fill){
        const ratio=target>0?actual[key]/target:0;
        fill.style.width=`${Math.max(0,Math.min(100,ratio*80))}%`;
        fill.classList.toggle("goal-progress-over",target>0&&actual[key]>target);
      }
      if(label)label.textContent=`${formatNumber(actual[key])} / ${formatNumber(target)}${key==="kcal"?"":" г"}`;
    }
  }
  dailyGoalToggle?.addEventListener("click",()=>{
    saveUndoSnapshot(dailyGoal.enabled?"Вимкнення денної цілі КБЖВ":"Увімкнення денної цілі КБЖВ");
    dailyGoal.enabled=!dailyGoal.enabled;
    const hasSavedTargets=Object.keys(goalInputs).some(key=>number(dailyGoal[key])>0);
    if(dailyGoal.enabled&&!hasSavedTargets)dailyGoalSettingsOpen=true;
    if(!dailyGoal.enabled)dailyGoalSettingsOpen=false;
    localStorage.setItem(DAILY_GOAL_KEY,JSON.stringify(dailyGoal));
    renderDailyGoal();
    showButtonState(dailyGoalToggle,dailyGoal.enabled?"Увімкнено":"Вимкнено",dailyGoal.enabled?"success":"error",1200);
    logAction(dailyGoal.enabled?"Денні цілі КБЖВ увімкнено.":"Денні цілі КБЖВ вимкнено.");
  });
  dailyGoalSave?.addEventListener("click",()=>{saveUndoSnapshot("Зміна денної цілі КБЖВ");for(const key of Object.keys(goalInputs))dailyGoal[key]=Math.max(0,number(goalInputs[key]?.value));localStorage.setItem(DAILY_GOAL_KEY,JSON.stringify(dailyGoal));dailyGoalSettingsOpen=false;renderDailyGoal();showButtonState(dailyGoalSave,"Цілі збережено","success",1400);logAction("Денні цілі КБЖВ збережено.");});
  dailyGoalDetailsToggle?.addEventListener("click",()=>{dailyGoalSettingsOpen=!dailyGoalSettingsOpen;renderDailyGoal();showButtonState(dailyGoalDetailsToggle,dailyGoalSettingsOpen?"Відкрито":"Закрито","success",900);logAction(dailyGoalSettingsOpen?"Налаштування денної цілі відкрито.":"Налаштування денної цілі закрито.");});
  dailyGoalCopyRemaining?.addEventListener("click",async()=>{
    if(!dailyGoal.enabled){showButtonState(dailyGoalCopyRemaining,"Ціль вимкнена","error",1400);logAction("Копіювання залишку не виконано: денна ціль вимкнена.");return;}
    const actual=getDailyGoalActual();
    const r={};for(const key of Object.keys(actual))r[key]=number(dailyGoal[key])-actual[key];
    const text=`Залишилось до денної цілі: ${formatNumber(r.kcal)} калорій / ${formatNumber(r.protein)} білка / ${formatNumber(r.fat)} жирів / ${formatNumber(r.carb)} вуглеводів / ${formatNumber(r.sugar)} цукрів / ${formatNumber(r.salt)} солі / ${formatNumber(r.fiber)} клітковини`;
    if(await copyText(text)){showButtonState(dailyGoalCopyRemaining,"Скопійовано","success",1400);logAction("Залишок до денної цілі скопійовано.");}
  });

  function calculatorNumber(value){
    if(typeof value==="number")return Number.isFinite(value)?value:0;
    const normalized=String(value??"").trim().replace(/\s+/g,"").replace(",",".");
    const n=Number(normalized);
    return Number.isFinite(n)?n:0;
  }

  function extractCalculatorNutrition(text){
    const source=String(text||"").replace(/\u00A0/g," ").trim();
    if(!source)return null;

    const get=(patterns)=>{
      for(const pattern of patterns){
        const match=source.match(pattern);
        if(match)return calculatorNumber(match[1]);
      }
      return null;
    };

    // Each nutrient is extracted independently by its label.
    // One unusual word/spacing elsewhere in the line can no longer zero out fats or another macro.
    const kcal=get([
      /([+-]?[\d]+(?:[.,]\d+)?)\s*(?:ккал|калор(?:ій|ії|ія|ійність)?)/i
    ]);
    const protein=get([
      /([+-]?[\d]+(?:[.,]\d+)?)\s*(?:г(?:рам(?:ів|и|а)?)?\s*)?(?:білка|білку|білків|білок)/i
    ]);
    const fat=get([
      /([+-]?[\d]+(?:[.,]\d+)?)\s*(?:г(?:рам(?:ів|и|а)?)?\s*)?(?:жирів|жиру|жири|жир)/i
    ]);
    const carb=get([
      /([+-]?[\d]+(?:[.,]\d+)?)\s*(?:г(?:рам(?:ів|и|а)?)?\s*)?(?:вуглеводів|вуглеводи|вуглеводу)/i
    ]);
    const sugar=get([
      /([+-]?[\d]+(?:[.,]\d+)?)\s*(?:г(?:рам(?:ів|и|а)?)?\s*)?(?:цукрів|цукру|цукри|цукор)/i
    ]);
    const salt=get([
      /([+-]?[\d]+(?:[.,]\d+)?)\s*(?:г(?:рам(?:ів|и|а)?)?\s*)?(?:солі|сіль)/i
    ]);
    const fiber=get([
      /([+-]?[\d]+(?:[.,]\d+)?)\s*(?:г(?:рам(?:ів|и|а)?)?\s*)?(?:клітковини|клітковина)/i
    ]);

    const recognized=[kcal,protein,fat,carb,sugar,salt,fiber].some(v=>v!==null);
    if(!recognized)return null;

    return {
      kcal:kcal??0,
      protein:protein??0,
      fat:fat??0,
      carb:carb??0,
      sugar:sugar??0,
      salt:salt??0,
      fiber:fiber??0
    };
  }

  function parseCalculatorLine(line){
    const clean=String(line).trim().replace(/\s+/g," ");if(!clean)return null;

    const nutrition=extractCalculatorNutrition(clean);
    if(nutrition){
      const nameMatch=clean.match(/^(.+?),\s*для\s+/i);
      const weightMatch=clean.match(/,\s*для\s*([+-]?[\d]+(?:[.,]\d+)?)\s*(?:грам(?:ів|и|а)?|гр|г|мл)/i);
      return {
        id:createId("calc"),
        name:nameMatch?nameMatch[1].trim():clean,
        weight:weightMatch?calculatorNumber(weightMatch[1]):0,
        ...nutrition,
        text:clean,
        created_at:new Date().toISOString()
      };
    }

    // Preserve the existing free-text behavior.
    const km=clean.match(/^[+]?\s*([+-]?[\d]+(?:[.,]\d+)?)\s*(?:ккал|калор(?:і|и|ій|ія|ійність)?)\s*$/i);
    if(km)return{id:createId("calc"),name:clean,weight:0,kcal:calculatorNumber(km[1]),protein:0,fat:0,carb:0,sugar:0,salt:0,fiber:0,text:clean,created_at:new Date().toISOString()};

    return{id:createId("calc"),name:clean,weight:0,kcal:0,protein:0,fat:0,carb:0,sugar:0,salt:0,fiber:0,text:clean,created_at:new Date().toISOString()};
  }

  function normalizeCalculatorItem(item){
    if(!item||typeof item!=="object")return item;
    const text=String(item.text||item.name||"").trim();
    const fromText=extractCalculatorNutrition(text);

    // For any line that contains labeled nutrition values, the visible text is the source of truth.
    // This also repairs old calculator rows that were saved with a wrong/zero fat value.
    if(fromText){
      return {
        ...item,
        ...fromText,
        text,
        id:item.id||createId("calc"),
        created_at:item.created_at||new Date().toISOString()
      };
    }

    return {
      ...item,
      kcal:calculatorNumber(item.kcal),
      protein:calculatorNumber(item.protein),
      fat:calculatorNumber(item.fat ?? item.fats),
      carb:calculatorNumber(item.carb ?? item.carbs),
      sugar:calculatorNumber(item.sugar ?? item.sugars),
      salt:calculatorNumber(item.salt),
      fiber:calculatorNumber(item.fiber ?? item.fibre)
    };
  }

  calcInput?.addEventListener("input",saveCalculatorDraft);
  calcAdd?.addEventListener("click",()=>{
    const text=calcInput.value.trim();if(!text){showButtonState(calcAdd,"Немає даних","error",1500);logAction("Додавання в калькулятор не виконано: поле порожнє.");return;}
    const items=text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).map(parseCalculatorLine).filter(Boolean).map(normalizeCalculatorItem);
    saveUndoSnapshot(`Додавання ${items.length} записів у калькулятор`);
    calculatorItems.push(...items);saveCalculatorLocal();renderCalculatorLog();updateTotals();calcInput.value="";localStorage.removeItem(CALCULATOR_DRAFT_KEY);showButtonState(calcAdd,"Додано","success",1500); logAction(`У калькулятор додано записів: ${items.length}.`);
  });
  calcSection?.addEventListener("click",()=>{saveUndoSnapshot("Додавання розділу в калькулятор");calculatorItems.push({text:"/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/",kcal:0,protein:0,fat:0,carb:0,sugar:0,salt:0,fiber:0});saveCalculatorLocal();renderCalculatorLog();showButtonState(calcSection,"Додано","success",1500);logAction("У калькулятор додано розділ.");});
  function quickPresetItem(metric,amount){
    const nutrition={kcal:0,protein:0,fat:0,carb:0,sugar:0,salt:0,fiber:0};
    nutrition[metric]=amount;
    const label=quickPresetLabel({metric,amount});
    return normalizeCalculatorItem({
      id:createId("calc"),
      name:label,
      text:label,
      weight:0,
      ...nutrition,
      created_at:new Date().toISOString()
    });
  }
  function addQuickPresetToCalculator(preset,button){
    const item=normalizeQuickPreset(preset);
    if(!item)return;
    saveUndoSnapshot(`Додавання ${quickPresetLabel(item)} у калькулятор`);
    calculatorItems.push(quickPresetItem(item.metric,item.amount));
    saveCalculatorLocal();
    renderCalculatorLog();
    updateTotals();
    showButtonState(button,"Додано","success");
    logAction(`У калькулятор додано ${quickPresetLabel(item)}.`);
  }
  function renderCalculatorQuickPresets(){
    if(!calcQuickPresets)return;
    calcQuickPresets.innerHTML="";
    calculatorQuickPresets.forEach(preset=>{
      const button=document.createElement("button");
      button.type="button";
      button.className="calc-quick-preset-button";
      button.textContent=quickPresetLabel(preset);
      button.addEventListener("click",()=>addQuickPresetToCalculator(preset,button));
      calcQuickPresets.append(button);
    });
    calcQuickPresets.hidden=!calculatorQuickPresets.length;
  }
  function renderCalculatorQuickPresetList(){
    if(!calcQuickList)return;
    calcQuickList.innerHTML="";
    if(!calculatorQuickPresets.length){
      const empty=document.createElement("div");
      empty.className="calc-quick-empty";
      empty.textContent="Швидких КБЖВ ще немає.";
      calcQuickList.append(empty);
      return;
    }
    calculatorQuickPresets.forEach(preset=>{
      const row=document.createElement("div");
      row.className="calc-quick-row";
      const name=document.createElement("div");
      name.className="calc-quick-row-name";
      name.textContent=quickPresetLabel(preset);
      const remove=document.createElement("button");
      remove.type="button";
      remove.className="calc-quick-remove";
      remove.textContent="Видалити";
      remove.addEventListener("click",()=>{
        saveUndoSnapshot("Видалення швидкого КБЖВ");
        calculatorQuickPresets=calculatorQuickPresets.filter(item=>item.id!==preset.id);
        saveCalculatorQuickPresets();
        renderCalculatorQuickPresetList();
        showButtonState(remove,"Видалено","success");
        logAction(`Швидке КБЖВ «${quickPresetLabel(preset)}» видалено.`);
      });
      row.append(name,remove);
      calcQuickList.append(row);
    });
  }
  function openCalculatorQuickModal(){
    renderCalculatorQuickPresetList();
    if(calcQuickValue)calcQuickValue.value="";
    calcQuickModal?.classList.add("active");
    document.body.classList.add("edit-modal-open");
    setTimeout(()=>calcQuickValue?.focus(),50);
    logAction("Відкрито налаштування швидких КБЖВ.");
  }
  function closeCalculatorQuickModal(){
    calcQuickModal?.classList.remove("active");
    document.body.classList.remove("edit-modal-open");
  }
  calcQuickManage?.addEventListener("click",openCalculatorQuickModal);
  calcQuickClose?.addEventListener("click",()=>{
    showButtonState(calcQuickClose,"Закрито","error");
    setTimeout(closeCalculatorQuickModal,260);
  });
  calcQuickModal?.addEventListener("click",event=>{if(event.target===calcQuickModal)closeCalculatorQuickModal();});
  calcQuickAdd?.addEventListener("click",()=>{
    const metric=String(calcQuickMetric?.value||"");
    const amount=calculatorNumber(calcQuickValue?.value);
    if(!QUICK_METRICS.has(metric)||!(amount>0)){
      showButtonState(calcQuickAdd,"Вкажіть значення","error");
      calcQuickValue?.focus();
      return;
    }
    const duplicate=calculatorQuickPresets.some(item=>item.metric===metric&&Math.abs(item.amount-amount)<0.0005);
    if(duplicate){
      showButtonState(calcQuickAdd,"Вже є","error");
      return;
    }
    saveUndoSnapshot("Додавання швидкого КБЖВ");
    const preset={id:createId("quick"),metric,amount:Math.round((amount+Number.EPSILON)*1000)/1000};
    calculatorQuickPresets.push(preset);
    saveCalculatorQuickPresets();
    renderCalculatorQuickPresetList();
    if(calcQuickValue)calcQuickValue.value="";
    showButtonState(calcQuickAdd,"Додано","success");
    logAction(`Створено швидке КБЖВ «${quickPresetLabel(preset)}».`);
  });
  calcQuickValue?.addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();calcQuickAdd?.click();}});
  calcClearText?.addEventListener("click",()=>{if(!calcInput.value.trim()){showButtonState(calcClearText,"Немає даних","error",1500);logAction("Очищення тексту не виконано: поле вже порожнє.");return;}saveUndoSnapshot("Очищення тексту калькулятора");calcInput.value="";localStorage.removeItem(CALCULATOR_DRAFT_KEY);showButtonState(calcClearText,"Очищено","success",1500);logAction("Поле введення калькулятора очищено.");});
  calcClearBlocks?.addEventListener("click",()=>{if(!calculatorItems.length){showButtonState(calcClearBlocks,"Немає даних","error",1500);logAction("Очищення історії калькулятора не виконано: історія порожня.");return;}if(!confirm("Очистити всю історію калькулятора?")){showButtonState(calcClearBlocks,"Не очищено","error",1500);logAction("Очищення історії калькулятора скасовано.");return;}saveUndoSnapshot("Очищення історії калькулятора");calculatorItems=[];saveCalculatorLocal();renderCalculatorLog();updateTotals();showButtonState(calcClearBlocks,"Очищено","success",1500);logAction("Історію калькулятора очищено.");});
  function updateTotals(){
    let repaired=false;
    const t=calculatorItems.reduce((a,raw,index)=>{
      const i=normalizeCalculatorItem(raw);
      if(i&&raw&&JSON.stringify(i)!==JSON.stringify(raw)){calculatorItems[index]=i;repaired=true;}
      for(const k of ["kcal","protein","fat","carb","sugar","salt","fiber"])a[k]+=calculatorNumber(i?.[k]);
      return a;
    },{kcal:0,protein:0,fat:0,carb:0,sugar:0,salt:0,fiber:0});
    if(repaired)saveCalculatorLocal();
    kcalElement.textContent=formatNumber(t.kcal);proteinElement.textContent=formatNumber(t.protein);fatElement.textContent=formatNumber(t.fat);carbElement.textContent=formatNumber(t.carb);sugarElement.textContent=formatNumber(t.sugar);saltElement.textContent=formatNumber(t.salt);fiberElement.textContent=formatNumber(t.fiber);updateDailyGoalRemaining();
  }
  function renderCalculatorLog(){
    calcLog.innerHTML="";
    calcLog.classList.toggle("calc-history-reorder-mode",calculatorReorderMode);
    if(!calculatorItems.length){calcLog.innerHTML='<div style="padding:10px 0;">Історія порожня.</div>';return;}
    calculatorItems.forEach((item,index)=>{
      const row=document.createElement("div");row.className="log-item calc-log-item";row.dataset.index=String(index);
      const text=document.createElement("span");text.className="calc-log-text";text.textContent=item.text||item.name||"";
      const remove=document.createElement("button");remove.className="remove";remove.textContent="Видалити";remove.onclick=()=>{const removed=calculatorItems[index];saveUndoSnapshot(`Видалення запису з калькулятора`);calculatorItems.splice(index,1);saveCalculatorLocal();renderCalculatorLog();updateTotals();logAction(`З калькулятора видалено: ${removed?.text||removed?.name||"запис"}.`);};
      const move=document.createElement("div");move.className="calc-history-move";
      const up=document.createElement("button");up.className="calc-move-button";up.textContent="↑";up.title="Перемістити вище";up.disabled=index===0;
      const down=document.createElement("button");down.className="calc-move-button";down.textContent="↓";down.title="Перемістити нижче";down.disabled=index===calculatorItems.length-1;
      up.onclick=()=>{if(index<=0)return;if(!calculatorReorderChanged)saveUndoSnapshot("Зміна розташування історії калькулятора");[calculatorItems[index-1],calculatorItems[index]]=[calculatorItems[index],calculatorItems[index-1]];calculatorReorderChanged=true;renderCalculatorLog();};
      down.onclick=()=>{if(index>=calculatorItems.length-1)return;if(!calculatorReorderChanged)saveUndoSnapshot("Зміна розташування історії калькулятора");[calculatorItems[index],calculatorItems[index+1]]=[calculatorItems[index+1],calculatorItems[index]];calculatorReorderChanged=true;renderCalculatorLog();};
      move.append(up,down);
      const actions=document.createElement("div");actions.className="calc-log-actions";actions.append(remove,move);
      row.append(text,actions);calcLog.append(row);
    });
  }
  reorderCalculatorHistory?.addEventListener("click",()=>{
    if(!calculatorItems.length){showButtonState(reorderCalculatorHistory,"Немає історії","error",1600);logAction("Зміну розташування історії не розпочато: історія порожня.");return;}
    if(!calculatorReorderMode){
      calculatorReorderMode=true;calculatorReorderChanged=false;
      setButtonStatusPermanent(reorderCalculatorHistory,"Готово","info");
      renderCalculatorLog();
      logAction("Розпочато зміну розташування історії калькулятора.");
      return;
    }
    calculatorReorderMode=false;
    if(calculatorReorderChanged){
      saveCalculatorLocal();updateTotals();renderCalculatorLog();
      showButtonState(reorderCalculatorHistory,"Розташування змінено","success",1800);
      logAction("Розташування історії калькулятора змінено.");
    }else{
      renderCalculatorLog();
      showButtonState(reorderCalculatorHistory,"Розташування не змінено","error",1800);
      logAction("Зміну розташування історії калькулятора завершено без змін.");
    }
  });
  function getTotalSummary(){return `Денний підсумок: ${kcalElement.textContent} калорій / ${proteinElement.textContent} білка / ${fatElement.textContent} жирів / ${carbElement.textContent} вуглеводів / ${sugarElement.textContent} цукрів / ${saltElement.textContent} солі / ${fiberElement.textContent} клітковини`;}
  copyTotal?.addEventListener("click",async()=>{if(await copyText(getTotalSummary()))showButtonState(copyTotal,"Скопійовано","success",1500);logAction("Денний підсумок скопійовано.");});
  function getCurrentDate(){const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;}
  function snapshotCalculatorComposition(){
    return calculatorItems.map(item=>({
      text:String(item?.text||item?.name||"").trim(),
      name:String(item?.name||"").trim(),
      weight:number(item?.weight)
    })).filter(item=>item.text||item.name);
  }
  saveArchive?.addEventListener("click",()=>{if(!calculatorItems.length){showButtonState(saveArchive,"Немає даних","error",1500);logAction("Збереження в архів не виконано: калькулятор порожній.");return alert("Немає даних для збереження в архів.");}saveUndoSnapshot("Збереження денного підсумку в архів");archiveItems.unshift({id:createId("archive"),date:getCurrentDate(),text:getTotalSummary(),comment:"",kcal:number(kcalElement.textContent),protein:number(proteinElement.textContent),fat:number(fatElement.textContent),carb:number(carbElement.textContent),sugar:number(sugarElement.textContent),salt:number(saltElement.textContent),fiber:number(fiberElement.textContent),composition:snapshotCalculatorComposition(),created_at:new Date().toISOString()});saveArchiveLocal();renderArchive();renderStatistics();showButtonState(saveArchive,"Збережено","success",1500);logAction(`Денний підсумок збережено в архів разом зі складом (${calculatorItems.length} записів).`);});
  function formatArchiveDate(v){const m=String(v||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}.${m[2]}.${m[1]}`:v;}
  function renderArchive(){
    updateSiteDataCounts();
    archiveLog.innerHTML="";if(!archiveItems.length){archiveLog.innerHTML='<div style="padding:10px 0;">Архів порожній.</div>';return;}
    archiveItems.forEach(item=>{
      const row=document.createElement("div");row.className="log-item archive-item";
      const content=document.createElement("div");content.className="archive-content";
      const date=document.createElement("div");date.style.fontWeight="600";date.style.color="var(--text-main)";date.textContent=formatArchiveDate(item.date);
      const text=document.createElement("div");text.textContent=item.text;content.append(date,text);
      const commentText=String(item.comment||"").trim();
      if(commentText){
        const comment=document.createElement("div");
        comment.className="archive-comment-preview";
        const label=document.createElement("strong");
        label.textContent="Коментар:";
        const value=document.createElement("span");
        value.textContent=commentText;
        comment.append(label,value);
        content.append(comment);
      }
      const actions=document.createElement("div");actions.className="archive-actions";
      const composition=document.createElement("button");composition.className="archive-composition-button";composition.textContent="Склад";if(!Array.isArray(item.composition)||!item.composition.length){composition.classList.add("archive-action-unavailable");composition.title="Склад для цього запису не був збережений";}
      const ed=document.createElement("button");ed.className="edit-date";ed.textContent="Дата";
      const et=document.createElement("button");et.className="edit-text";et.textContent="Текст";et.dataset.archiveId=String(item.id);
      const commentButton=document.createElement("button");commentButton.className="archive-comment-button";commentButton.textContent="Коментар";commentButton.dataset.archiveId=String(item.id);
      const rm=document.createElement("button");rm.className="remove";rm.textContent="Видалити";
      composition.onclick=()=>openArchiveComposition(item,composition);
      ed.onclick=()=>editArchiveDate(item,date,ed);
      et.onclick=()=>openArchiveTextModal(item,et);
      commentButton.onclick=()=>openArchiveCommentModal(item,commentButton);
      rm.onclick=()=>{if(confirm("Видалити цей запис з архіву?")){saveUndoSnapshot("Видалення запису з архіву");archiveItems=archiveItems.filter(a=>a.id!==item.id);saveArchiveLocal();renderArchive();renderStatistics();logAction("Запис видалено з архіву.");}else{showButtonState(rm,"Видалити","error",900);logAction("Видалення запису з архіву скасовано.");}};
      actions.append(ed,et,composition,commentButton,rm);row.append(content,actions);archiveLog.append(row);
    });
  }
  function archiveCompositionLine(entry){
    if(typeof entry==="string")return entry;
    if(!entry||typeof entry!=="object")return "";
    const text=String(entry.text||"").trim();
    const name=String(entry.name||"").trim();
    const weight=number(entry.weight);
    if(weight>0&&name)return `${name} — ${formatNumber(weight)} г`;
    return text||name;
  }
  function openArchiveComposition(item,button){
    if(!archiveCompositionModal||!archiveCompositionList)return;
    archiveCompositionSourceButton=button||null;
    const composition=Array.isArray(item?.composition)?item.composition:[];
    archiveCompositionList.innerHTML="";
    if(archiveCompositionDate)archiveCompositionDate.textContent=formatArchiveDate(item?.date||"");

    if(!composition.length){
      const empty=document.createElement("div");
      empty.className="archive-composition-empty";
      empty.textContent="Склад для цього запису не був збережений.";
      archiveCompositionList.append(empty);
      clearButtonStatus(button);
      button.textContent=button.dataset.originalText||"Склад";
      logAction(`Перегляд складу архіву за ${formatArchiveDate(item?.date||"")} — даних немає.`);
    }else{
      composition.forEach(entry=>{
        const line=archiveCompositionLine(entry);
        if(!line)return;
        if(/^\/-\/-/.test(line)){
          const divider=document.createElement("div");
          divider.className="archive-composition-divider";
          archiveCompositionList.append(divider);
          return;
        }
        const row=document.createElement("div");
        row.className="archive-composition-entry";
        row.textContent=line;
        archiveCompositionList.append(row);
      });
      clearButtonStatus(button);
      button.textContent=button.dataset.originalText||"Склад";
      logAction(`Відкрито склад денного підсумку за ${formatArchiveDate(item?.date||"")} (${composition.length} записів).`);
    }

    archiveCompositionModal.classList.add("active");
    document.body.classList.add("edit-modal-open");
  }
  function closeArchiveComposition(logClose=true,acknowledged=false){
    const sourceButton=archiveCompositionSourceButton;
    archiveCompositionSourceButton=null;
    archiveCompositionModal?.classList.remove("active");
    document.body.classList.remove("edit-modal-open");

    if(sourceButton){
      if(acknowledged){
        requestAnimationFrame(()=>showButtonState(sourceButton,"Склад","success"));
      }else{
        clearButtonStatus(sourceButton);
        sourceButton.textContent=sourceButton.dataset.originalText||"Склад";
      }
    }

    if(logClose)logAction(acknowledged?"Перегляд складу денного підсумку підтверджено.":"Перегляд складу денного підсумку закрито без підтвердження.");
  }
  archiveCompositionClose?.addEventListener("click",()=>{
    showButtonState(archiveCompositionClose,"Зрозуміло","success");
    setTimeout(()=>closeArchiveComposition(true,true),360);
  });
  archiveCompositionModal?.addEventListener("click",e=>{
    if(e.target===archiveCompositionModal)closeArchiveComposition(true,false);
  });

  function editArchiveDate(item,dateElement,actionButton){
    if(dateElement.querySelector("input"))return;
    logAction(`Відкрито зміну дати запису архіву за ${formatArchiveDate(item.date||"")}.`);
    const original=item.date||"";
    const input=document.createElement("input");
    input.type="date";
    input.className="archive-date-input";
    input.value=original||getCurrentDate();
    dateElement.textContent="";
    dateElement.append(input);
    input.focus();

    let done=false;
    const finish=()=>{
      if(done)return;
      done=true;
      if(input.value&&input.value!==original){
        saveUndoSnapshot("Зміна дати запису архіву");
        item.date=input.value;
        saveArchiveLocal();
        renderStatistics();
        dateElement.textContent=formatArchiveDate(item.date);
        showButtonState(actionButton,"Дата","success",900);
        logAction(`Дата запису архіву змінена з ${original} на ${input.value}.`);
      }else{
        dateElement.textContent=formatArchiveDate(original);
        showButtonState(actionButton,"Дата","error",900);
        logAction(input.value?"Зміну дати архіву завершено без змін.":"Зміну дати архіву скинуто/скасовано без збереження.");
      }
    };
    input.addEventListener("change",finish,{once:true});
    input.addEventListener("blur",finish,{once:true});
  }
  function openArchiveTextModal(item,actionButton){archiveEditingId=item.id;archiveOriginalText=item.text||"";archiveEditingButton=actionButton||null;archiveTextInput.value=item.text||"";archiveTextModal.classList.add("active");document.body.classList.add("edit-modal-open");logAction(`Відкрито редагування тексту запису архіву за ${formatArchiveDate(item.date||"")}.`);setTimeout(()=>archiveTextInput.focus(),50);}
  function closeArchiveTextModal(){archiveEditingId=null;archiveOriginalText=null;archiveEditingButton=null;archiveTextModal.classList.remove("active");document.body.classList.remove("edit-modal-open");}
  archiveTextCancel?.addEventListener("click",()=>{const outer=archiveEditingButton;showButtonState(archiveTextCancel,"Скасовано","error",500);closeArchiveTextModal();showButtonState(outer,"Текст","error",900);logAction("Редагування тексту архіву скасовано.");});
  archiveTextModal?.addEventListener("click",e=>{if(e.target===archiveTextModal){const outer=archiveEditingButton;closeArchiveTextModal();showButtonState(outer,"Текст","error",900);logAction("Редагування тексту архіву закрито без збереження.");}});
  archiveTextSave?.addEventListener("click",()=>{const item=archiveItems.find(a=>a.id===archiveEditingId);const outer=archiveEditingButton;if(!item)return closeArchiveTextModal();const text=archiveTextInput.value.trim();if(!text)return archiveTextInput.focus();if(text!==archiveOriginalText){saveUndoSnapshot("Зміна тексту запису архіву");item.text=text;saveArchiveLocal();showButtonState(archiveTextSave,"Збережено","success");logAction("Текст запису архіву змінено.");closeArchiveTextModal();renderArchive();const refreshedOuter=[...archiveLog.querySelectorAll(".edit-text")].find(button=>button.dataset.archiveId===String(item.id));showButtonState(refreshedOuter,"Текст","success");}else{showButtonState(archiveTextSave,"Не змінено","error");showButtonState(outer,"Текст","error");logAction("Текст запису архіву залишено без змін.");closeArchiveTextModal();}});

  function updateArchiveCommentLimit(){
    if(!archiveCommentInput||!archiveCommentLimit)return 0;
    const over=Math.max(0,Array.from(archiveCommentInput.value).length-500);
    archiveCommentLimit.textContent=over?`Перевищено ліміт на ${over} символів.`:"";
    archiveCommentLimit.classList.toggle("active",over>0);
    return over;
  }
  function openArchiveCommentModal(item,actionButton){
    archiveCommentEditingId=item.id;
    archiveCommentOriginal=String(item.comment||"");
    archiveCommentEditingButton=actionButton||null;
    archiveCommentInput.value=archiveCommentOriginal;
    updateArchiveCommentLimit();
    archiveCommentModal?.classList.add("active");
    document.body.classList.add("edit-modal-open");
    logAction(`Відкрито коментар до запису архіву за ${formatArchiveDate(item.date||"")}.`);
    setTimeout(()=>archiveCommentInput?.focus(),50);
  }
  function closeArchiveCommentModal(){
    archiveCommentEditingId=null;
    archiveCommentOriginal="";
    archiveCommentEditingButton=null;
    archiveCommentModal?.classList.remove("active");
    document.body.classList.remove("edit-modal-open");
    if(archiveCommentLimit){archiveCommentLimit.textContent="";archiveCommentLimit.classList.remove("active");}
  }
  archiveCommentInput?.addEventListener("input",updateArchiveCommentLimit);
  archiveCommentCancel?.addEventListener("click",()=>{
    const outer=archiveCommentEditingButton;
    showButtonState(archiveCommentCancel,"Скасовано","error");
    closeArchiveCommentModal();
    showButtonState(outer,"Коментар","error");
    logAction("Редагування коментаря архіву скасовано.");
  });
  archiveCommentModal?.addEventListener("click",event=>{
    if(event.target===archiveCommentModal){
      const outer=archiveCommentEditingButton;
      closeArchiveCommentModal();
      showButtonState(outer,"Коментар","error");
      logAction("Коментар архіву закрито без збереження.");
    }
  });
  archiveCommentSave?.addEventListener("click",()=>{
    const item=archiveItems.find(entry=>entry.id===archiveCommentEditingId);
    const outer=archiveCommentEditingButton;
    if(!item)return closeArchiveCommentModal();
    if(updateArchiveCommentLimit()>0){
      showButtonState(archiveCommentSave,"Забагато символів","error");
      archiveCommentInput?.focus();
      return;
    }
    const comment=String(archiveCommentInput?.value||"").trim();
    if(comment!==archiveCommentOriginal){
      saveUndoSnapshot("Зміна коментаря запису архіву");
      item.comment=comment;
      saveArchiveLocal();
      showButtonState(archiveCommentSave,"Збережено","success");
      logAction(comment?"Коментар до запису архіву збережено.":"Коментар до запису архіву очищено.");
      closeArchiveCommentModal();
      renderArchive();
      const refreshed=[...archiveLog.querySelectorAll(".archive-comment-button")].find(button=>button.dataset.archiveId===String(item.id));
      showButtonState(refreshed,"Коментар","success");
    }else{
      showButtonState(archiveCommentSave,"Не змінено","error");
      showButtonState(outer,"Коментар","error");
      logAction("Коментар архіву залишено без змін.");
      closeArchiveCommentModal();
    }
  });

  function parseArchiveMetrics(item){
    const result={kcal:number(item.kcal),protein:number(item.protein),fat:number(item.fat),carb:number(item.carb),sugar:number(item.sugar),salt:number(item.salt),fiber:number(item.fiber)};
    if(Object.values(result).some(v=>v!==0))return result;
    const t=String(item.text||"");
    const patterns={kcal:/([\d.,]+)\s*(?:калорій|ккал)/i,protein:/([\d.,]+)\s*білка/i,fat:/([\d.,]+)\s*жирів/i,carb:/([\d.,]+)\s*вуглеводів/i,sugar:/([\d.,]+)\s*цукрів/i,salt:/([\d.,]+)\s*солі/i,fiber:/([\d.,]+)\s*клітковини/i};
    for(const [k,re] of Object.entries(patterns)){const m=t.match(re);if(m)result[k]=number(m[1].replace(",","."));}
    return result;
  }
  function syncStatsToToday(render=true){
    if(!statsToToday||!statsTo)return;
    statsToToday.checked=statsToTodayEnabled;
    statsTo.disabled=statsToTodayEnabled;
    if(statsToTodayEnabled)statsTo.value=getCurrentDate();
    if(render)renderStatistics();
  }
  function setupStatisticsDates(){
    const dates=archiveItems.map(i=>i.date).filter(Boolean).sort();
    if(dates.length&&!statsFrom.value)statsFrom.value=dates[0];
    if(statsToTodayEnabled){
      if(statsTo)statsTo.value=getCurrentDate();
    }else if(dates.length&&!statsTo.value){
      statsTo.value=dates[dates.length-1];
    }
  }
  function statsMetricLabel(){
    return ({kcal:"Калорії",protein:"Білки",fat:"Жири",carb:"Вуглеводи",sugar:"Цукри",salt:"Сіль",fiber:"Клітковина"})[statsMetric]||statsMetric;
  }
  function formatStatsDate(iso){const [y,m,d]=String(iso).split("-");return `${d}.${m}.${y}`;}
  function renderMonthlyArchiveSummary(){
    if(!statsMonthSummary)return;
    const now=new Date(),year=now.getFullYear(),month=now.getMonth();
    const prefix=`${year}-${String(month+1).padStart(2,"0")}-`;
    const recordedDays=new Set(archiveItems.map(i=>String(i.date||"")).filter(d=>d.startsWith(prefix))).size;
    const daysInMonth=new Date(year,month+1,0).getDate();
    const monthLabel=new Intl.DateTimeFormat("uk-UA",{month:"long"}).format(now).toLowerCase();
    statsMonthSummary.textContent=`${year} рік, ${monthLabel}: записано ${recordedDays} днів з ${daysInMonth}.`;
  }
  function renderStatistics(){
    renderMonthlyArchiveSummary();
    if(!statsChart)return;
    const archivePage=document.getElementById("archive");
    if(!archivePage?.classList.contains("active"))return;
    setupStatisticsDates();
    const from=statsFrom.value||"0000-01-01",to=statsTo.value||"9999-12-31";
    const points=archiveItems.filter(i=>i.date>=from&&i.date<=to).map(i=>({date:i.date,value:parseArchiveMetrics(i)[statsMetric]})).sort((a,b)=>a.date.localeCompare(b.date));
    const ctx=statsChart.getContext("2d"),rect=statsChart.getBoundingClientRect(),dpr=window.devicePixelRatio||1,w=Math.max(300,rect.width),h=Math.max(260,rect.height);
    statsChart.width=w*dpr;statsChart.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    statsRenderedPoints=[];statsChartGeometry=null;if(statsTooltip)statsTooltip.classList.remove("active");
    if(points.length<3){statsEmpty.style.display="flex";return;}statsEmpty.style.display="none";
    const vals=points.map(p=>p.value),rawMin=Math.min(...vals),rawMax=Math.max(...vals),rawRange=rawMax-rawMin||Math.max(Math.abs(rawMax)*.1,1),margin=rawRange*.12;
    const min=Math.max(0,rawMin-margin),max=rawMax+margin,range=max-min||1;
    const pad={l:58,r:18,t:18,b:48},cw=w-pad.l-pad.r,ch=h-pad.t-pad.b;
    const css=getComputedStyle(document.documentElement),primary=css.getPropertyValue("--primary-color").trim(),secondary=css.getPropertyValue("--text-secondary").trim(),gridColor=css.getPropertyValue("--bg-card").trim(),bodyStyle=getComputedStyle(document.body);
    ctx.font=`11px ${bodyStyle.fontFamily}`;ctx.lineWidth=1;ctx.strokeStyle=gridColor;ctx.fillStyle=secondary;
    const yTicks=6;
    for(let i=0;i<=yTicks;i++){const y=pad.t+ch*i/yTicks;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke();ctx.textAlign="right";ctx.fillText(formatNumber(max-range*i/yTicks),pad.l-7,y+4);}
    const coords=points.map((p,i)=>({x:pad.l+(points.length===1?cw/2:cw*i/(points.length-1)),y:pad.t+ch*(max-p.value)/range,...p}));
    const xStep=Math.max(1,Math.ceil(points.length/(w<520?4:7)));
    coords.forEach((p,i)=>{if(i%xStep===0||i===coords.length-1){ctx.strokeStyle=gridColor;ctx.beginPath();ctx.moveTo(p.x,pad.t);ctx.lineTo(p.x,h-pad.b);ctx.stroke();ctx.fillStyle=secondary;ctx.textAlign="center";ctx.fillText(p.date.slice(8,10)+"."+p.date.slice(5,7),p.x,h-18);}});
    ctx.strokeStyle=primary;ctx.lineWidth=2;ctx.beginPath();coords.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
    ctx.fillStyle="#ef4444";coords.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,4.5,0,Math.PI*2);ctx.fill();});
    statsRenderedPoints=coords;statsChartGeometry={w,h,pad};
  }
  function inspectStatisticsPoint(clientX,clientY){
    if(!statsRenderedPoints.length||!statsTooltip)return;
    const rect=statsChart.getBoundingClientRect(),x=clientX-rect.left,y=clientY-rect.top;
    let nearest=statsRenderedPoints[0],dist=Infinity;
    statsRenderedPoints.forEach(p=>{const d=Math.hypot(p.x-x,p.y-y);if(d<dist){dist=d;nearest=p;}});
    const ctx=statsChart.getContext("2d"),g=statsChartGeometry;if(!g)return;
    renderStatistics();
    ctx.save();ctx.setLineDash([4,4]);ctx.strokeStyle="rgba(220,221,222,.65)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(nearest.x,g.pad.t);ctx.lineTo(nearest.x,g.h-g.pad.b);ctx.moveTo(g.pad.l,nearest.y);ctx.lineTo(g.w-g.pad.r,nearest.y);ctx.stroke();ctx.restore();
    ctx.fillStyle="#ef4444";ctx.beginPath();ctx.arc(nearest.x,nearest.y,6.5,0,Math.PI*2);ctx.fill();
    statsTooltip.innerHTML=`<strong>${formatNumber(nearest.value)} ${statsMetric==="kcal"?"калорій":"г"}</strong><span>${formatStatsDate(nearest.date)} · ${statsMetricLabel()}</span>`;
    const wrap=statsChart.parentElement,tw=statsTooltip.offsetWidth||160,th=statsTooltip.offsetHeight||54;
    statsTooltip.style.left=`${Math.max(8,Math.min(wrap.clientWidth-tw-8,nearest.x+14))}px`;
    statsTooltip.style.top=`${Math.max(8,Math.min(wrap.clientHeight-th-8,nearest.y-th-10))}px`;statsTooltip.classList.add("active");
  }
  statsChart?.addEventListener("mousemove",e=>inspectStatisticsPoint(e.clientX,e.clientY));
  function medicineTodayRecord(){ return medicineArchive.find(r=>r.date===getCurrentDate()); }
  function closeMedicineModal(modal){modal?.classList.remove("active");modal?.setAttribute("aria-hidden","true");document.body.classList.remove("edit-modal-open");}
  function openMedicineForm(modal){modal?.classList.add("active");modal?.setAttribute("aria-hidden","false");document.body.classList.add("edit-modal-open");setTimeout(()=>modal?.querySelector("input")?.focus(),50);}
  function closeMedicineSelectModal(){closeMedicineModal(medicineSelectModal);}
  function medicineDetail(m){return [m.name,m.dose,m.full_name].filter(Boolean).join(" · ");}
  function openMedicineSelectModal(){
    if(!medicines.length){showButtonState(medicineOpenToday,"Немає ліків","error",1500);logAction("Вибір ліків не відкрито: база ліків порожня.");return;}
    const today=medicineTodayRecord(),taken=new Set(Array.isArray(today?.taken_ids)?today.taken_ids:[]);medicineSelectList.innerHTML="";
    medicines.forEach(m=>{const row=document.createElement("div");row.className="medicine-row medicine-select-row";const label=document.createElement("label");label.className="medicine-check";const check=document.createElement("input");check.type="checkbox";check.checked=taken.has(m.id);check.dataset.id=m.id;const text=document.createElement("span");text.innerHTML=`<strong>${escapeHtml(m.name)}</strong>${m.dose?`<small>${escapeHtml(m.dose)}</small>`:""}`;label.append(check,text);row.append(label);medicineSelectList.append(row);});
    openMedicineForm(medicineSelectModal);
  }
  function renderMedicineCard(m,container,kind){const row=document.createElement("div");row.className="medicine-row medicine-base-item";const info=document.createElement("div");info.className="medicine-info";info.innerHTML=`<strong>${escapeHtml(m.name)}</strong>${m.dose?`<span>Дозування: ${escapeHtml(m.dose)}</span>`:""}${m.full_name?`<small>${escapeHtml(m.full_name)}</small>`:""}`;const remove=document.createElement("button");remove.type="button";remove.className="medicine-remove";remove.textContent="Видалити";remove.onclick=()=>{const label=kind==="buy"?"зі списку покупок":"з бази ліків";if(!confirm(`Видалити «${m.name}» ${label}?`)){showButtonState(remove,"Не видалено","error",1300);logAction(`Видалення «${m.name}» скасовано.`);return;}if(kind==="buy"){medicineBuy=medicineBuy.filter(x=>x.id!==m.id);saveMedicineBuyLocal();}else{medicines=medicines.filter(x=>x.id!==m.id);saveMedicinesLocal();}renderMedicines();logAction(`Видалено «${m.name}» ${label}.`);};row.append(info,remove);container.append(row);}
  function renderMedicines(){
    if(!medicineBaseList||!medicineHistory)return;const today=medicineTodayRecord();medicineBaseList.innerHTML="";medicineBuyList.innerHTML="";
    if(!medicines.length)medicineBaseList.innerHTML='<div class="medicine-empty">База ліків порожня.</div>';else medicines.forEach(m=>renderMedicineCard(m,medicineBaseList,"base"));
    if(!medicineBuy.length)medicineBuyList.innerHTML='<div class="medicine-empty">Список покупок порожній.</div>';else medicineBuy.forEach(m=>renderMedicineCard(m,medicineBuyList,"buy"));
    if(!medicines.length)medicineTodaySummary.textContent="Спочатку додайте ліки до своєї бази.";else if(!today)medicineTodaySummary.textContent="За сьогодні ліки ще не записані.";else{const names=today.taken_names||[];medicineTodaySummary.textContent=names.length?`Сьогодні записано: ${names.join(", ")}.`:"За сьогодні жодні ліки не відмічені як прийняті.";}
    medicineHistory.innerHTML="";if(!medicineArchive.length){medicineHistory.innerHTML='<div class="medicine-empty">Архів ліків порожній.</div>';return;}
    [...medicineArchive].sort((a,b)=>String(b.date).localeCompare(String(a.date))).forEach(r=>{const all=r.all_names||[],taken=r.taken_names||[],missed=all.filter(n=>!taken.includes(n));let status="Ліки зовсім не записані.";if(all.length&&taken.length===all.length)status="Всі ліки записано.";else if(taken.length)status=`Записані: ${taken.join(", ")}. Не записані: ${missed.join(", ")||"—"}.`;const row=document.createElement("div");row.className="medicine-history-item";const content=document.createElement("div");const date=document.createElement("strong");date.textContent=formatArchiveDate(r.date);const text=document.createElement("div");text.textContent=status;content.append(date,text);const actions=document.createElement("div");actions.className="archive-actions medicine-history-actions";const dateBtn=document.createElement("button");dateBtn.textContent="Дата";const del=document.createElement("button");del.className="remove";del.textContent="Видалити";dateBtn.onclick=()=>editMedicineDate(r,date);del.onclick=()=>{if(!confirm("Видалити цей запис з архіву ліків?")){showButtonState(del,"Не видалено","error",1300);logAction("Видалення запису архіву ліків скасовано.");return;}medicineArchive=medicineArchive.filter(x=>x!==r);saveMedicineArchiveLocal();renderMedicines();logAction("Запис видалено з архіву ліків.");};actions.append(dateBtn,del);row.append(content,actions);medicineHistory.append(row);});
  }
  function editMedicineDate(item,dateElement){if(dateElement.querySelector("input"))return;const original=item.date||"";const input=document.createElement("input");input.type="date";input.className="archive-date-input";input.value=original||getCurrentDate();dateElement.textContent="";dateElement.append(input);input.focus();let done=false;const finish=()=>{if(done)return;done=true;if(input.value&&input.value!==original){item.date=input.value;saveMedicineArchiveLocal();logAction(`Дата запису архіву ліків змінена з ${original} на ${input.value}.`);}else logAction("Зміну дати архіву ліків завершено без змін.");renderMedicines();};input.addEventListener("change",finish,{once:true});input.addEventListener("blur",finish,{once:true});}
  medicineOpenAdd?.addEventListener("click",()=>openMedicineForm(medicineAddModal));
  medicineAddCancel?.addEventListener("click",()=>{closeMedicineModal(medicineAddModal);showButtonState(medicineAddCancel,"Скасовано","error",1200);});
  medicineAddSave?.addEventListener("click",()=>{const name=medicineFormName.value.trim(),dose=medicineFormDose.value.trim(),full_name=medicineFormFull.value.trim();if(!name||!dose||!full_name){showButtonState(medicineAddSave,"Заповніть поля","error",1500);return;}if(medicines.some(m=>m.name.toLowerCase()===name.toLowerCase())){showButtonState(medicineAddSave,"Вже є","error",1400);return;}medicines.push({id:createId("medicine"),name,dose,full_name,created_at:new Date().toISOString()});saveMedicinesLocal();[medicineFormName,medicineFormDose,medicineFormFull].forEach(x=>x.value="");closeMedicineModal(medicineAddModal);renderMedicines();showButtonState(medicineOpenAdd,"Додано","success",1400);logAction(`Додано ліки «${name}».`);});
  medicineOpenBuyAdd?.addEventListener("click",()=>openMedicineForm(medicineBuyModal));medicineBuyCancel?.addEventListener("click",()=>{closeMedicineModal(medicineBuyModal);showButtonState(medicineBuyCancel,"Скасовано","error",1200);});
  medicineBuySave?.addEventListener("click",()=>{const name=medicineBuyName.value.trim(),dose=medicineBuyDose.value.trim(),full_name=medicineBuyFull.value.trim();if(!name||!dose||!full_name){showButtonState(medicineBuySave,"Заповніть поля","error",1500);return;}medicineBuy.push({id:createId("buy"),name,dose,full_name,created_at:new Date().toISOString()});saveMedicineBuyLocal();[medicineBuyName,medicineBuyDose,medicineBuyFull].forEach(x=>x.value="");closeMedicineModal(medicineBuyModal);renderMedicines();showButtonState(medicineOpenBuyAdd,"Додано","success",1400);logAction(`До списку покупок додано «${name}».`);});
  medicineClearAll?.addEventListener("click",()=>{if(!medicines.length){showButtonState(medicineClearAll,"База порожня","error",1300);return;}if(!confirm("Ви справді бажаєте очистити всю базу даних ліків?")){showButtonState(medicineClearAll,"Скасовано","error",1400);logAction("Очищення бази ліків скасовано.");return;}medicines=[];saveMedicinesLocal();renderMedicines();showButtonState(medicineClearAll,"Очищено","success",1400);logAction("Базу ліків повністю очищено.");});
  medicineOpenToday?.addEventListener("click",openMedicineSelectModal);medicineSelectCancel?.addEventListener("click",()=>{closeMedicineSelectModal();showButtonState(medicineSelectCancel,"Скасовано","error",1200);});medicineSelectModal?.addEventListener("click",e=>{if(e.target===medicineSelectModal)closeMedicineSelectModal();});
  medicineSaveDay?.addEventListener("click",()=>{if(!medicines.length)return;const checked=[...medicineSelectList.querySelectorAll('input[type="checkbox"]:checked')].map(x=>x.dataset.id),allNames=medicines.map(m=>m.name),takenNames=medicines.filter(m=>checked.includes(m.id)).map(m=>m.name),rec={date:getCurrentDate(),taken_ids:checked,all_names:allNames,taken_names:takenNames,updated_at:new Date().toISOString()};const i=medicineArchive.findIndex(r=>r.date===rec.date);if(i>=0)medicineArchive[i]=rec;else medicineArchive.unshift(rec);saveMedicineArchiveLocal();closeMedicineSelectModal();renderMedicines();showButtonState(medicineOpenToday,"Додано","success",1500);logAction("Ліки за сьогодні записано в архів.");});

  statsChart?.addEventListener("mouseleave",()=>{statsTooltip?.classList.remove("active");renderStatistics();});
  statsChart?.addEventListener("click",e=>inspectStatisticsPoint(e.clientX,e.clientY));
  statsChart?.addEventListener("touchstart",e=>{const t=e.touches[0];if(t)inspectStatisticsPoint(t.clientX,t.clientY);},{passive:true});
  statsMetricButtons.forEach(button=>button.addEventListener("click",()=>{statsMetric=button.dataset.metric;statsMetricButtons.forEach(b=>b.classList.toggle("active",b===button));renderStatistics();showButtonState(button,button.dataset.originalText||button.textContent,"success",800);logAction(`Статистику перемкнено на показник «${button.dataset.originalText||button.textContent}».`);}));
  [statsFrom,statsTo].forEach(input=>input?.addEventListener("change",()=>{if(statsFrom.value&&statsTo.value){const days=Math.round((new Date(statsTo.value)-new Date(statsFrom.value))/86400000);if(days<3){showButtonState(statsMetricButtons[0],"Мінімум 3 дні","error",1200);logAction("Період статистики не змінено: мінімальний період 3 дні.");return;}}renderStatistics();logAction(`Період статистики змінено: ${statsFrom.value||"початок"} — ${statsTo.value||"кінець"}.`);}));
  statsToToday?.addEventListener("change",()=>{
    statsToTodayEnabled=!!statsToToday.checked;
    localStorage.setItem(STATS_TO_TODAY_KEY,statsToTodayEnabled?"1":"0");
    syncStatsToToday(true);
    logAction(statsToTodayEnabled?"Статистику встановлено до поточного дня.":"Автоматичну дату «До поточного дня» вимкнено.");
  });
  window.addEventListener("resize",()=>{if(document.getElementById("archive")?.classList.contains("active"))renderStatistics();});


  showRegister?.addEventListener("click",()=>switchAuthMode("register"));
  showLogin?.addEventListener("click",()=>switchAuthMode("login"));
  registerPassword?.addEventListener("input",renderPasswordStrength);

  loginForm?.addEventListener("submit",async event=>{
    event.preventDefault();const username=String(loginUsername?.value||"").trim(),password=String(loginPassword?.value||""),rememberMe=!!loginRemember?.checked;
    if(!username||!password){setAuthMessage("Введіть логін і пароль.","error");return;}
    loginSubmit.disabled=true;setAuthMessage("Вхід...","info");
    try{const session=await authApi("/auth/login",{method:"POST",body:{username,password,rememberMe},token:""});await completeAuthentication(session,rememberMe);}
    catch(error){setAuthMessage(error?.message||"Не вдалося увійти.","error");}
    finally{loginSubmit.disabled=false;}
  });

  registerForm?.addEventListener("submit",async event=>{
    event.preventDefault();const username=String(registerUsername?.value||"").trim(),password=String(registerPassword?.value||""),confirmation=String(registerPasswordConfirm?.value||""),accessCode=String(registerAccessCode?.value||"").trim(),rememberMe=!!registerRemember?.checked;
    if(username.length<3||username.length>32){setAuthMessage("Логін повинен містити від 3 до 32 символів.","error");return;}
    const passwordError=validateRegistrationPassword(password);if(passwordError){setAuthMessage(passwordError,"error");return;}
    if(password!==confirmation){setAuthMessage("Паролі не збігаються.","error");return;}
    registerSubmit.disabled=true;setAuthMessage("Створення акаунта...","info");
    try{const session=await authApi("/auth/register",{method:"POST",body:{username,password,accessCode,rememberMe},token:""});await completeAuthentication(session,rememberMe);}
    catch(error){setAuthMessage(error?.message||"Не вдалося зареєструватися.","error");}
    finally{registerSubmit.disabled=false;}
  });

  logoutAccount?.addEventListener("click",async()=>{
    const ok=confirm("Ви справді бажаєте покинути сайт та вийти з акаунта?");
    if(!ok){showButtonState(logoutAccount,"Скасовано","error");return;}
    logAction("Вихід: виконано вихід з акаунта.");
    showButtonState(logoutAccount,"Вихід...","error",0);
    try{await flushAuditQueue();}catch(_){}
    performLogout();
  });
  deleteAccountButton?.addEventListener("click",async()=>{
    if(!authUser){showButtonState(deleteAccountButton,"Немає акаунта","error");return;}

    const username=String(authUser.username||"");
    const ok=confirm(
      `Ви справді бажаєте НАЗАВЖДИ видалити акаунт «${username}»?\n\n`+
      "Буде видалено сам акаунт, серверні сесії та історію входів. "+
      "Локальні дані цього акаунта на цьому пристрої також буде стерто. "+
      "Цю дію неможливо скасувати."
    );
    if(!ok){showButtonState(deleteAccountButton,"Скасовано","error");return;}

    const typed=prompt(`Для підтвердження введіть логін акаунта:\n${username}`);
    if(typed===null){showButtonState(deleteAccountButton,"Скасовано","error");return;}
    if(String(typed).trim()!==username){
      showButtonState(deleteAccountButton,"Логін не збігається","error");
      return;
    }

    deleteAccountButton.disabled=true;
    showButtonState(deleteAccountButton,"Видалення...","error",0);

    try{
      const deletingUserId=authUser.id;
      await authApi("/auth/account",{method:"DELETE"});

      const prefix=`kbjv_user_${String(deletingUserId)}_`;
      const removeKeys=[];
      for(let i=0;i<localStorage.length;i++){
        const key=localStorage.key(i);
        if(key&&key.startsWith(prefix))removeKeys.push(key);
      }
      removeKeys.forEach(key=>localStorage.removeItem(key));
      localStorage.removeItem(`kbjv_legacy_migrated_v47_${deletingUserId}`);

      clearAuthSession();
      alert("Акаунт видалено.");
      window.location.reload();
    }catch(error){
      deleteAccountButton.disabled=false;
      showButtonState(deleteAccountButton,error?.status===0?"Немає мережі":"Помилка","error");
      alert(error?.message||"Не вдалося видалити акаунт.");
    }
  });
  adminRefresh?.addEventListener("click",()=>loadAdminUsers(true));
  adminLoginsClose?.addEventListener("click",()=>{
    showButtonState(adminLoginsClose,"Закрито","error");
    setTimeout(closeAdminLoginHistory,260);
  });
  adminLoginsModal?.addEventListener("click",event=>{if(event.target===adminLoginsModal)closeAdminLoginHistory();});

  let modalLockedScrollY=0;
  function syncModalScrollLock(){
    const activeModal=[...document.querySelectorAll(".product-modal")].some(modal=>modal.classList.contains("active"));
    const locked=document.body.classList.contains("modal-scroll-locked");
    if(activeModal&&!locked){
      modalLockedScrollY=window.scrollY||window.pageYOffset||0;
      document.body.classList.add("modal-scroll-locked");
      document.body.style.top=`-${modalLockedScrollY}px`;
    }else if(!activeModal&&locked){
      const restoreY=modalLockedScrollY;
      document.body.classList.remove("modal-scroll-locked");
      document.body.style.top="";
      window.scrollTo(0,restoreY);
    }
  }

  window.addEventListener("online",()=>void flushAuditQueue());
  window.addEventListener("resize",scheduleTopTabFit);
  window.addEventListener("orientationchange",()=>setTimeout(scheduleTopTabFit,120));

  const modalScrollObserver=new MutationObserver(syncModalScrollLock);
  document.querySelectorAll(".product-modal").forEach(modal=>modalScrollObserver.observe(modal,{attributes:true,attributeFilter:["class"]}));
  syncModalScrollLock();

  // Fixed app viewport on touch devices: keep one-finger vertical scrolling,
  // but block pinch/gesture/double-tap page zoom.
  ["gesturestart","gesturechange","gestureend"].forEach(type=>{
    document.addEventListener(type,event=>event.preventDefault(),{passive:false});
  });
  document.addEventListener("touchmove",event=>{
    if(event.touches&&event.touches.length>1)event.preventDefault();
  },{passive:false});
  document.addEventListener("dblclick",event=>event.preventDefault(),{passive:false});

  refreshSiteButton?.addEventListener("click",async()=>{
    showButtonState(refreshSiteButton,"Оновлення...","success",0);
    logAction("Оновлення: запущено перевірку актуальної версії сайту.");
    localStorage.setItem(ACTIVE_TAB_KEY,"blocks");
    try{
      if("serviceWorker" in navigator){
        const registration=await navigator.serviceWorker.getRegistration();
        if(registration)await registration.update();
      }
      try{
        await fetch(`./index.html?refresh=${Date.now()}`,{cache:"no-store"});
      }catch(_){}
    }catch(error){
      console.warn("Refresh update check failed:",error);
    }
    setTimeout(()=>window.location.reload(),250);
  });

  undoLastAction?.addEventListener("click",applyUndoSnapshot);

  clearSiteButton?.addEventListener("click",()=>{
    const ok=confirm("Ви справді бажаєте повністю очистити сайт для поточного акаунта?\n\nБуде видалено блоки КБЖВ, калькулятор, архів, статистику, консоль, денну ціль та локальні налаштування. Акаунт залишиться авторизованим.");
    if(!ok){showButtonState(clearSiteButton,"Скасовано","error",1600);return;}
    queueAuditAction("Очищено локальні дані сайту для поточного акаунта.");
    const keys=[PRODUCTS_KEY,CALCULATOR_KEY,ARCHIVE_KEY,ACTIVE_TAB_KEY,CALCULATOR_DRAFT_KEY,SORT_KEY,SORT_SCHEMA_KEY,RANDOM_SORT_SEED_KEY,CATEGORY_ORDER_KEY,CUSTOM_CATEGORIES_KEY,DELETED_DEFAULT_CATEGORIES_KEY,DEPARTMENTS_ENABLED_KEY,PROFILE_KEY,CALC_QUICK_PRESETS_KEY,CONSOLE_KEY,EXPORT_VERSION_KEY,DATABASE_UPDATED_KEY,EXPORT_FINGERPRINT_KEY,DAILY_GOAL_KEY,LAST_EXPORT_KEY,LAST_IMPORT_KEY,UNDO_KEY,STATS_TO_TODAY_KEY,MEDICINES_KEY,MEDICINE_ARCHIVE_KEY,MEDICINE_BUY_KEY];
    keys.forEach(key=>localStorage.removeItem(key));
    localStorage.setItem(ACTIVE_TAB_KEY,"blocks");
    sessionStorage.setItem("kbjv_skip_login_log_once","1");
    showButtonState(clearSiteButton,"Очищено","error",0);
    setTimeout(()=>window.location.reload(),450);
  });

  document.addEventListener("keydown",e=>{
    if(e.key!=="Escape")return;
    [productModal,addProductModal,editProductModal,productOrderModal,sortProductsModal,categoryOrderModal,customCategoryModal,deleteProductModal,archiveTextModal,archiveCommentModal,archiveCompositionModal,calcQuickModal,adminLoginsModal].forEach(m=>m?.classList.remove("active"));
    selectedProduct=null;editingProduct=null;archiveEditingId=null;document.body.classList.remove("edit-modal-open");
  });
  productWeight?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();productCopy.click();}});
  [newProductName,newProductKcal,newProductProtein,newProductFat,newProductCarb,newProductSugar,newProductSalt,newProductFiber,...newProductQuickWeights].forEach(i=>i?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();addProductSave.click();}}));
  [editProductName,editProductKcal,editProductProtein,editProductFat,editProductCarb,editProductSugar,editProductSalt,editProductFiber,...editProductQuickWeights].forEach(i=>i?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();editProductSave.click();}}));

  function initializeAuthenticatedApp(){
    if(appInitialized)return;appInitialized=true;
    departmentsEnabled=localStorage.getItem(DEPARTMENTS_ENABLED_KEY)!=="0";
    populateProductCategorySelects();
    currentSort=localStorage.getItem(SORT_KEY)||"categories";
    if(!localStorage.getItem(SORT_SCHEMA_KEY)){if(currentSort==="manual")currentSort="categories";localStorage.setItem(SORT_KEY,currentSort);localStorage.setItem(SORT_SCHEMA_KEY,"1");}
    if(!VALID_SORT_MODES.has(currentSort)){currentSort="categories";localStorage.setItem(SORT_KEY,currentSort);}
    if(!departmentsEnabled&&currentSort==="categories"){currentSort="initial";localStorage.setItem(SORT_KEY,currentSort);}
    updateSortOptionState();
    statsToTodayEnabled=localStorage.getItem(STATS_TO_TODAY_KEY)==="1";
    products=loadArray(PRODUCTS_KEY).map((p,i)=>normalizeProduct(p,i));syncStatsToToday(false);calculatorItems=loadArray(CALCULATOR_KEY).map(normalizeCalculatorItem);saveCalculatorLocal();archiveItems=loadArray(ARCHIVE_KEY);consoleItems=loadArray(CONSOLE_KEY);
    const draft=localStorage.getItem(CALCULATOR_DRAFT_KEY);if(draft!==null&&calcInput)calcInput.value=draft;
    loadProfile();loadCalculatorQuickPresets();loadDailyGoal();renderProducts();renderCalculatorLog();updateTotals();renderArchive();renderConsole();renderStatistics();updateSiteDataCounts();setInterval(updateSiteDataCounts,60000);
    let saved=localStorage.getItem(ACTIVE_TAB_KEY)||"blocks";
    if(saved==="admin"&&authUser?.role!=="admin")saved="blocks";
    if(!["blocks","calculator","archive","console","profile","admin"].includes(saved))saved="blocks";
    activateAppPage(saved,{save:false});
    if(sessionStorage.getItem("kbjv_skip_login_log_once")==="1")sessionStorage.removeItem("kbjv_skip_login_log_once");
    else logAction(`Вхід у акаунт «${authUser?.username||"Користувач"}».`);
  }

  bootstrapAuthentication();
});
