document.addEventListener('DOMContentLoaded', async () => {

  /* =======================================================
     STATE
     ======================================================= */

  const state = {
    settings: null,
    defaults: null,

    files: {
      background: [],
      font: []
    }
  };


  /* =======================================================
     COLOR VARIABLES
     ======================================================= */

  const colorNames = [
    '--color-white',
    '--color-black',
    '--color-text',
    '--color-light-text',
    '--color-background',
    '--color-primary',
    '--color-primary-hover',
    '--color-border',
    '--color-border-light',
    '--color-border-white',
    '--color-input-background',
    '--color-input-text',
    '--color-game-gray',
    '--color-game-border',
    '--color-game-selected',
    '--color-match-0',
    '--color-match-1',
    '--color-match-2',
    '--color-match-3',
    '--color-match-4',
    '--color-match-5',
    '--color-match-6',
    '--color-match-7',
    '--color-match-8',
    '--color-match-9',
    '--color-time-low',
    '--color-time-up',
    '--color-congrats',
    '--color-word-found',
    '--color-table-hover',
    '--color-score',
    '--color-result-heading'
  ];


  /* =======================================================
     BACKGROUND SETTINGS
     ======================================================= */

  const backgroundSlots = [
    [
      'indexLandscape',
      'Start Screen — Landscape',
      'start-screen.jpg'
    ],
    [
      'indexPortrait',
      'Start Screen — Portrait',
      'start-screen-p.jpg'
    ],
    [
      'gameLandscape',
      'Game — Landscape',
      'game-background.jpg'
    ],
    [
      'gamePortrait',
      'Game — Portrait',
      'game-background-p.jpg'
    ],
    [
      'resultLandscape',
      'Results — Landscape',
      'leaderboard.jpg'
    ],
    [
      'resultPortrait',
      'Results — Portrait',
      'leaderboard-p.jpg'
    ],
    [
      'settingLandscape',
      'Settings — Landscape',
      'setting.jpg'
    ],
    [
      'settingPortrait',
      'Settings — Portrait',
      'setting-p.jpg'
    ],
    [
      'userLandscape',
      'User — Landscape',
      'user.jpg'
    ],
    [
      'userPortrait',
      'User — Portrait',
      'user-p.jpg'
    ]
  ];


  /* =======================================================
     HELPERS
     ======================================================= */

  const $ = (id) => document.getElementById(id);

  const clone = (value) =>
    JSON.parse(JSON.stringify(value));


  /* =======================================================
     MESSAGE
     ======================================================= */

  function showMessage(message, type = 'success') {

    const element = $('settings-message');

    element.textContent = message;

    element.className =
      `settings-message show ${type}`;

    clearTimeout(showMessage.timer);

    showMessage.timer = setTimeout(() => {
      element.classList.remove('show');
    }, 3200);
  }


  /* =======================================================
     COLOR HELPERS
     ======================================================= */

  function cleanLabel(name) {

    return name
      .replace(/^--/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (character) =>
        character.toUpperCase()
      );
  }


  function colorToHex(value) {

    const text = String(value || '').trim();

    if (/^#[0-9a-f]{6}$/i.test(text)) {
      return text;
    }

    if (/^#[0-9a-f]{3}$/i.test(text)) {
      return (
        '#' +
        text
          .slice(1)
          .split('')
          .map((value) => value + value)
          .join('')
      );
    }

    const rgb = text.match(
      /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*[\d.]+)?\s*\)$/i
    );

    if (rgb) {

      return (
        '#' +
        [rgb[1], rgb[2], rgb[3]]
          .map((value) =>
            Number(value)
              .toString(16)
              .padStart(2, '0')
          )
          .join('')
      );
    }

    return {
      red: '#ff0000',
      white: '#ffffff',
      black: '#000000',
      whitesmoke: '#f5f5f5'
    }[text.toLowerCase()] || '#000000';
  }


  function colorAlpha(value) {

    const match = String(value || '').match(
      /rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/i
    );

    if (!match) {
      return 1;
    }

    return Math.max(
      0,
      Math.min(1, Number(match[1]))
    );
  }


  function hexToRgba(hex, alpha) {

    const clean = hex.replace('#', '');

    const red = parseInt(
      clean.slice(0, 2),
      16
    );

    const green = parseInt(
      clean.slice(2, 4),
      16
    );

    const blue = parseInt(
      clean.slice(4, 6),
      16
    );

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }


  /* =======================================================
     COLOR CONTROL
     ======================================================= */

  function makeColorControl(variable, value) {

    const wrapper =
      document.createElement('div');

    wrapper.className =
      'color-control';

    wrapper.dataset.variable =
      variable;


    const label =
      document.createElement('label');

    label.textContent =
      cleanLabel(variable);

    label.title = variable;


    const row =
      document.createElement('div');

    row.className =
      'color-row';


    const picker =
      document.createElement('input');

    picker.type = 'color';
    picker.className = 'color-picker';
    picker.value = colorToHex(value);


    const text =
      document.createElement('input');

    text.type = 'text';
    text.className = 'color-value';
    text.value = value;


    row.append(
      picker,
      text
    );


    const alphaRow =
      document.createElement('div');

    alphaRow.className =
      'alpha-row';


    const alphaLabel =
      document.createElement('span');

    alphaLabel.textContent =
      'Opacity';


    const alpha =
      document.createElement('input');

    alpha.type = 'range';
    alpha.min = '0';
    alpha.max = '1';
    alpha.step = '0.01';
    alpha.value = colorAlpha(value);


    const alphaValue =
      document.createElement('span');

    alphaValue.className =
      'alpha-value';

    alphaValue.textContent =
      `${Math.round(Number(alpha.value) * 100)}%`;


    alphaRow.append(
      alphaLabel,
      alpha,
      alphaValue
    );


    const preview = () => {

      document.documentElement.style.setProperty(
        variable,
        text.value
      );
    };


    picker.addEventListener(
      'input',
      () => {

        text.value =
          Number(alpha.value) < 1
            ? hexToRgba(
                picker.value,
                Number(alpha.value)
              )
            : picker.value;

        preview();
      }
    );


    alpha.addEventListener(
      'input',
      () => {

        alphaValue.textContent =
          `${Math.round(
            Number(alpha.value) * 100
          )}%`;

        text.value =
          Number(alpha.value) < 1
            ? hexToRgba(
                colorToHex(text.value),
                Number(alpha.value)
              )
            : colorToHex(text.value);

        preview();
      }
    );


    text.addEventListener(
      'input',
      preview
    );


    wrapper.append(
      label,
      row,
      alphaRow
    );

    return wrapper;
  }


  function renderColors() {

    const container =
      $('color-controls');

    container.innerHTML = '';


    colorNames.forEach((name) => {

      container.appendChild(
        makeColorControl(
          name,
          state.settings.colors[name] ||
            '#000000'
        )
      );
    });


    $('color-count').textContent =
      `${colorNames.length} colors`;
  }


  function readColorsFromUI() {

    const colors = {};

    document
      .querySelectorAll('.color-control')
      .forEach((control) => {

        colors[
          control.dataset.variable
        ] =
          control
            .querySelector('.color-value')
            .value
            .trim();
      });

    return colors;
  }


  /* =======================================================
     ASSETS
     ======================================================= */

  async function refreshAssets() {

    for (
      const type of ['background', 'font']
    ) {

      const result =
        await window.myAPI.listAssets(type);

      if (result.success) {
        state.files[type] =
          result.files;
      }
    }

    renderFontFiles();
    renderBackgroundSlots();
  }


  /* =======================================================
     FONT
     ======================================================= */

  function fontFamilyFromFile(file) {

    return String(file || '')
      .replace(
        /\.(ttf|otf|woff2?)$/i,
        ''
      )
      .replace(
        /[-_]+/g,
        ' '
      )
      .trim() || 'Custom Font';
  }


  function renderFontFiles() {

    const select =
      $('font-file');

    select.innerHTML = '';


    if (!state.files.font.length) {

      const option =
        document.createElement('option');

      option.value = '';
      option.textContent =
        'No fonts uploaded';

      select.appendChild(option);

    } else {

      state.files.font.forEach(
        (file) => {

          const option =
            document.createElement('option');

          option.value = file;
          option.textContent = file;

          select.appendChild(option);
        }
      );
    }


    select.value =
      state.settings.fontFile || '';


    const list =
      $('font-files');

    list.innerHTML = '';


    state.files.font.forEach(
      (file) => {

        list.appendChild(
          createFontRow(file)
        );
      }
    );
  }


  function createFontRow(file) {

    const row =
      document.createElement('div');

    row.className =
      'asset-list-row';


    const name =
      document.createElement('span');

    name.textContent = file;


    const actions =
      document.createElement('div');

    actions.className =
      'asset-actions';


    const use =
      document.createElement('button');

    use.type = 'button';
    use.className =
      'secondary-btn small';

    use.textContent = 'Use';


    use.addEventListener(
      'click',
      async () => {

        state.settings.fontFile =
          file;

        state.settings.fontFamily =
          fontFamilyFromFile(file);

        $('font-family').value =
          state.settings.fontFamily;

        await saveSettings(true);

        renderFontFiles();
      }
    );


    const remove =
      document.createElement('button');

    remove.type = 'button';
    remove.className =
      'danger-btn small';

    remove.textContent =
      'Delete';


    remove.addEventListener(
      'click',
      async () => {

        if (!confirm(`Delete ${file}?`)) {
          return;
        }

        const result =
          await window.myAPI.deleteAsset(
            'font',
            file
          );

        if (!result.success) {

          showMessage(
            result.message ||
              'Delete failed.',
            'error'
          );

          return;
        }


        state.files.font =
          result.files;


        if (
          state.settings.fontFile ===
          file
        ) {

          state.settings.fontFile =
            state.files.font[0] || '';

          state.settings.fontFamily =
            state.settings.fontFile
              ? fontFamilyFromFile(
                  state.settings.fontFile
                )
              : 'sans-serif';

          $('font-family').value =
            state.settings.fontFamily;

          await saveSettings(false);
        }


        renderFontFiles();

        showMessage(
          `${file} deleted.`
        );
      }
    );


    actions.append(
      use,
      remove
    );

    row.append(
      name,
      actions
    );

    return row;
  }


  /* =======================================================
     BACKGROUNDS
     ======================================================= */

  function renderBackgroundSlots() {

    const container =
      $('background-slots');

    container.innerHTML = '';


    backgroundSlots.forEach(
      ([key, label, targetName]) => {

        container.appendChild(
          createBackgroundSlot(
            key,
            label,
            targetName,
            state.settings.backgrounds[key] || ''
          )
        );
      }
    );
  }


  function createBackgroundSlot(
    key,
    label,
    targetName,
    current
  ) {

    const card =
      document.createElement('article');

    card.className =
      'asset-slot';


    const heading =
      document.createElement('div');

    heading.className =
      'slot-heading';


    const title =
      document.createElement('h3');

    title.textContent = label;


    const target =
      document.createElement('code');

    target.textContent =
      targetName;


    heading.append(
      title,
      target
    );


    const currentText =
      document.createElement('p');

    currentText.className =
      'current-file';

    currentText.textContent =
      current
        ? `Current: ${current}`
        : 'Current: none';


    if (current) {

      const preview =
        document.createElement('img');

      preview.className =
        'asset-preview';

      preview.alt = label;

      preview.loading =
        'eager';


      preview.onerror = () => {

        preview.classList.add(
          'missing-preview'
        );

        preview.alt =
          'Image not found';
      };


      window.myAPI
        .assetUrl(
          'background',
          current
        )
        .then((result) => {

          if (
            result.success &&
            result.url
          ) {

            preview.src =
              `${result.url}?v=${Date.now()}`;

          } else {

            preview.classList.add(
              'missing-preview'
            );

            preview.alt =
              'Image not found';
          }
        });


      card.appendChild(preview);

    } else {

      const empty =
        document.createElement('div');

      empty.className =
        'asset-preview empty-preview';

      empty.textContent =
        'No image';

      card.appendChild(empty);
    }


    const input =
      document.createElement('input');

    input.type = 'file';

    input.accept =
      '.jpg,.jpeg,.png,.webp,.gif';


    const upload =
      document.createElement('button');

    upload.type = 'button';

    upload.className =
      'secondary-btn';

    upload.textContent =
      'Upload / Replace';


    upload.addEventListener(
      'click',
      async () => {

        const file =
          input.files[0];

        if (!file) {

          showMessage(
            'Choose an image first.',
            'error'
          );

          return;
        }


        const data =
          new Uint8Array(
            await file.arrayBuffer()
          );


        const result =
          await window.myAPI.uploadAsset(
            'background',
            targetName,
            data
          );


        if (!result.success) {

          showMessage(
            result.message ||
              'Upload failed.',
            'error'
          );

          return;
        }


        state.settings.backgrounds[key] =
          result.fileName;

        state.files.background =
          result.files;


        await saveSettings(false);

        renderBackgroundSlots();

        showMessage(
          `${result.fileName} uploaded and applied.`
        );
      }
    );


    const remove =
      document.createElement('button');

    remove.type = 'button';

    remove.className =
      'danger-btn small';

    remove.textContent =
      'Delete';

    remove.disabled =
      !current;


    remove.addEventListener(
      'click',
      async () => {

        if (
          !current ||
          !confirm(`Delete ${current}?`)
        ) {
          return;
        }


        const result =
          await window.myAPI.deleteAsset(
            'background',
            current
          );


        if (!result.success) {

          showMessage(
            result.message ||
              'Delete failed.',
            'error'
          );

          return;
        }


        state.files.background =
          result.files;

        state.settings.backgrounds[key] =
          '';


        await saveSettings(false);

        renderBackgroundSlots();

        showMessage(
          `${current} deleted.`
        );
      }
    );


    const controls =
      document.createElement('div');

    controls.className =
      'slot-controls';


    controls.append(
      input,
      upload,
      remove
    );


    card.append(
      heading,
      currentText,
      controls
    );


    return card;
  }


  /* =======================================================
     FONT PREVIEW
     ======================================================= */

  function applyFontPreview() {

    const family =
      state.settings.fontFamily ||
      'sans-serif';

    const file =
      state.settings.fontFile || '';


    let style =
      document.getElementById(
        'dynamic-font-style'
      );


    if (!style) {

      style =
        document.createElement('style');

      style.id =
        'dynamic-font-style';

      document.head.appendChild(style);
    }


    if (file) {

      const format =
        /\.ttf$/i.test(file)
          ? 'truetype'
          : /\.otf$/i.test(file)
            ? 'opentype'
            : /\.woff2$/i.test(file)
              ? 'woff2'
              : /\.woff$/i.test(file)
                ? 'woff'
                : '';


      const safeFamily =
        family.replace(
          /"/g,
          '\\"'
        );


      style.textContent =
        `@font-face {
          font-family: "${safeFamily}";
          src: url("../public/fonts/${encodeURIComponent(file)}")${format ? ` format("${format}")` : ''};
          font-weight: 100 900;
          font-style: normal;
          font-display: swap;
        }`;

    } else {

      style.textContent = '';
    }


    document.documentElement.style.setProperty(
      '--font-family',
      `"${family}", sans-serif`
    );
  }


  /* =======================================================
     SAVE SETTINGS
     ======================================================= */

  async function saveSettings(
    showNotice = true
  ) {

    state.settings.colors =
      readColorsFromUI();


    state.settings.fontFamily =
      $('font-family')
        .value
        .trim() ||
      'sans-serif';


    state.settings.fontFile =
      $('font-file').value ||
      '';


    state.settings.game = {

      timerDuration: Math.max(
        10,
        parseInt(
          $('timer-duration').value,
          10
        ) || 60
      ),

      gridSize: Math.max(
        5,
        Math.min(
          30,
          parseInt(
            $('grid-size').value,
            10
          ) || 17
        )
      ),

      wordCount: Math.max(
        1,
        Math.min(
          50,
          parseInt(
            $('word-count').value,
            10
          ) || 7
        )
      )
    };


    const result =
      await window.myAPI.saveSettings(
        clone(state.settings)
      );


    if (!result.success) {

      if (showNotice) {

        showMessage(
          result.message ||
            'Could not save settings.',
          'error'
        );
      }

      return false;
    }


    state.settings =
      result.settings;


    applyFontPreview();


    if (showNotice) {

      showMessage(
        'Settings saved successfully.'
      );
    }


    return true;
  }


  /* =======================================================
     FORM
     ======================================================= */

  function populateForm() {

    $('font-family').value =
      state.settings.fontFamily ||
      'sans-serif';


    $('timer-duration').value =
      state.settings.game?.timerDuration ||
      60;


    $('grid-size').value =
      state.settings.game?.gridSize ||
      17;


    $('word-count').value =
      state.settings.game?.wordCount ||
      7;


    applyFontPreview();

    renderColors();
  }


  /* =======================================================
     WORDS XML
     ======================================================= */

  async function refreshWordsXml() {

    const result =
      await window.myAPI.getWordsXmlInfo();


    if (!result.success) {

      $('words-xml-current').textContent =
        'words.xml';

      $('words-xml-status').textContent =
        result.message ||
        'Unable to check file';

      $('words-xml-status')
        .classList.add('missing');

      $('delete-words-xml').disabled =
        true;

      return;
    }


    $('words-xml-current').textContent =
      result.fileName ||
      'words.xml';


    $('words-xml-status').textContent =
      result.exists
        ? 'Available'
        : 'Not found';


    $('words-xml-status')
      .classList.toggle(
        'missing',
        !result.exists
      );


    $('delete-words-xml').disabled =
      !result.exists;
  }


  /* =======================================================
     WORDS XML UPLOAD
     ======================================================= */

  $('upload-words-xml')
    .addEventListener(
      'click',
      async () => {

        const input =
          $('words-xml-upload');

        const file =
          input.files[0];


        if (!file) {

          showMessage(
            'Choose an XML file first.',
            'error'
          );

          return;
        }


        if (
          !/\.xml$/i.test(file.name)
        ) {

          showMessage(
            'Only XML files are allowed.',
            'error'
          );

          return;
        }


        if (
          !confirm(
            'Replace the current words.xml file?'
          )
        ) {
          return;
        }


        try {

          const data =
            new Uint8Array(
              await file.arrayBuffer()
            );


          const result =
            await window.myAPI.uploadWordsXml(
              data
            );


          if (!result.success) {

            showMessage(
              result.message ||
                'Words XML upload failed.',
              'error'
            );

            return;
          }


          input.value = '';

          await refreshWordsXml();


          showMessage(
            'words.xml uploaded successfully.'
          );

        } catch (error) {

          console.error(
            'Words XML upload error:',
            error
          );

          showMessage(
            'Words XML upload failed.',
            'error'
          );
        }
      }
    );


  /* =======================================================
     WORDS XML DELETE
     ======================================================= */

  $('delete-words-xml')
    .addEventListener(
      'click',
      async () => {

        if (
          !confirm(
            'Delete public/xml/words.xml?'
          )
        ) {
          return;
        }


        const result =
          await window.myAPI.deleteWordsXml();


        if (!result.success) {

          showMessage(
            result.message ||
              'Could not delete words.xml.',
            'error'
          );

          return;
        }


        await refreshWordsXml();


        showMessage(
          'words.xml deleted.'
        );
      }
    );


  /* =======================================================
     WORDS XML EXPORT
     ======================================================= */

  $('export-words-xml')
    .addEventListener(
      'click',
      async () => {

        const result =
          await window.myAPI.exportWordsXml();


        if (!result.success) {

          showMessage(
            result.message ||
              'Could not export words.xml.',
            'error'
          );

          return;
        }


        showMessage(
          `words.xml exported to: ${result.path}`
        );
      }
    );


  /* =======================================================
     SAVE / RESET
     ======================================================= */

  $('save-settings')
    .addEventListener(
      'click',
      () => saveSettings(true)
    );


  $('reset-settings')
    .addEventListener(
      'click',
      async () => {

        if (
          !confirm(
            'Reset colors, font selection, game settings and background assignments to the original defaults? Uploaded files will NOT be deleted.'
          )
        ) {
          return;
        }


        state.settings =
          clone(state.defaults);


        populateForm();

        await saveSettings(true);

        await refreshAssets();
      }
    );


  /* =======================================================
     FONT UPLOAD
     ======================================================= */

  $('upload-font')
    .addEventListener(
      'click',
      async () => {

        const input =
          $('font-upload');

        const file =
          input.files[0];


        if (!file) {

          showMessage(
            'Choose a font file first.',
            'error'
          );

          return;
        }


        const data =
          new Uint8Array(
            await file.arrayBuffer()
          );


        const result =
          await window.myAPI.uploadAsset(
            'font',
            file.name,
            data
          );


        if (!result.success) {

          showMessage(
            result.message ||
              'Font upload failed.',
            'error'
          );

          return;
        }


        state.files.font =
          result.files;


        state.settings.fontFile =
          result.fileName;


        state.settings.fontFamily =
          fontFamilyFromFile(
            result.fileName
          );


        $('font-family').value =
          state.settings.fontFamily;


        input.value = '';


        await saveSettings(false);

        renderFontFiles();


        showMessage(
          `${result.fileName} uploaded and applied.`
        );
      }
    );


  /* =======================================================
     FONT SELECTION
     ======================================================= */

  $('font-file')
    .addEventListener(
      'change',
      async (event) => {

        const selected =
          event.target.value;


        if (!selected) {
          return;
        }


        state.settings.fontFile =
          selected;


        state.settings.fontFamily =
          fontFamilyFromFile(
            selected
          );


        $('font-family').value =
          state.settings.fontFamily;


        await saveSettings(false);

        renderFontFiles();
      }
    );


  /* =======================================================
     RESULTS
     ======================================================= */

  $('export-results')
    .addEventListener(
      'click',
      async () => {

        const result =
          await window.myAPI.exportResultsExcel();


        showMessage(
          result.success
            ? `Results exported to: ${result.path}`
            : (
                result.message ||
                'No results file to export.'
              ),
          result.success
            ? 'success'
            : 'error'
        );
      }
    );


  $('delete-results')
    .addEventListener(
      'click',
      async () => {

        if (
          !confirm(
            'Delete all exported result Excel files from the separate exported-results folder?'
          )
        ) {
          return;
        }


        const result =
          await window.myAPI.deleteResultsExcel();


        showMessage(
          result.success
            ? 'Exported result files deleted.'
            : (
                result.message ||
                'Could not delete exported results.'
              ),
          result.success
            ? 'success'
            : 'error'
        );
      }
    );


  /* =======================================================
     INITIALIZE
     ======================================================= */

  try {

    const settings =
      await window.myAPI.getSettings();


    state.settings =
      clone(settings);

    state.defaults =
      clone(settings);


    populateForm();

    await refreshAssets();

    await refreshWordsXml();

    applyFontPreview();

  } catch (error) {

    console.error(
      'Settings initialization error:',
      error
    );

    showMessage(
      'Could not load settings.',
      'error'
    );
  }

});