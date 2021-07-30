Hooks.on("pickerDone", (element, color) => {
  // Handle Theme
  let $element = $(element);
  let $settings = $element.closest('#echThemeOptions');
  
  if ($settings.length > 0) {
    $settings.find('.window-content select[name="theme"]').val('custom');
  }
});

class echThemeOptions extends FormApplication {
  static get defaultOptions() {
    return { 
      ...super.defaultOptions,
      title: "Theme Options",
      id: "echThemeOptions",
      template: "modules/enhancedcombathud/templates/theme-options.hbs",
      resizable: true,
      width: 660,
      height: $(window).height(),
      downloadTheme: () => {
        function setDeepObj(obj, path, val) {
          var props = path.split('.');
          for (var i = 0, n = props.length - 1; i < n; ++i) {
            obj = obj[props[i]] = obj[props[i]] || {};
          }
          obj[props[i]] = val;
          return obj;
        }

        let theme = {};
    
        $('#echThemeOptions .window-content button[name="colored"]').each((index, button) => { 
          let $button = $(button);
          setDeepObj(theme, $button.data('setting'), $button.attr('value'));
        });

        // Export Theme
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(theme.colors));
        var copyTextarea = document.createElement('textarea');
        copyTextarea.value = JSON.stringify(theme.colors);
        document.body.appendChild(copyTextarea);
        copyTextarea.select();
        document.execCommand('copy');
        copyTextarea.remove();
        ui.notifications.info("Argon - Combat HUD Theme has been copied to your clipboard. Paste it into a text file to save.");
      }
    }
  }
  getData() {
    return {
      themeOptions: game.settings.get("enhancedcombathud", "echThemeData")
    };
  }
  activateListeners(html) {
    super.activateListeners(html);
    // Hex to rgba
    function _convertHexUnitTo256(hexStr) { return parseInt(hexStr.repeat(2 / hexStr.length), 16); };
    const getTextColor = (hexColor) => {
      const rgbaColor = (hex) => {
        const hexArr = hex.slice(1).match(new RegExp(".{2}", "g"));
        const [r, g, b, a] = hexArr.map(_convertHexUnitTo256);
        return [r, g, b, Math.round((a / 256 + Number.EPSILON) * 100) / 100];
      }

      const rgba = rgbaColor(hexColor);
      const brightness = Math.round(((rgba[0] * 299) + (rgba[1] * 587) + (rgba[2] * 114)) / 1000);

      if (rgba[3] > 0.5) {
        return (brightness > 125) ? 'black' : 'white';
      } else {
        return 'black';
      }
    } 
    
    $(html).find('select[name="theme"]').val(game.settings.get("enhancedcombathud", "echThemeData").theme);

    // Handle Theme Selection
    $(html).find('select[name="theme"]').on('change', (event) => {
      let selectedTheme = $(event.currentTarget).val();
      const updateColors = (theme) => {
        $(html).find('button[name="colored"]').each((index, button) => {
          let $button = $(button);
          let setting = $button.data('setting').replace(/colors\./g, '');
          let value = setting.split('.').reduce((p, c) => p && p[c] || null, theme);

          if (value != null) {
            $button.attr('value', value).css({
              'background-color': value,
              'color': getTextColor(value)
            });
          }
        })
      }

      if (selectedTheme != 'custom') {
        fetch(`./modules/enhancedcombathud/scripts/themes/${selectedTheme}.json`).then(response => response.json()).then(colors => {
          updateColors(colors);
        });
      }else{
        updateColors(game.settings.get("enhancedcombathud", "echThemeData").colors);
      }
    }).trigger('change');

    // Update Custom Themes

  }
  async _updateObject(event, formData) {
    function setDeepObj(obj, path, val) {
      var props = path.split('.');
      for (var i = 0, n = props.length - 1; i < n; ++i) {
        obj = obj[props[i]] = obj[props[i]] || {};
      }
      obj[props[i]] = val;
      return obj;
    }

    let themeOptions = game.settings.get("enhancedcombathud", "echThemeData")

    $(event.srcElement).find('button[name="colored"]').each((index, button) => { 
      let $button = $(button);
      setDeepObj(formData, $button.data('setting'), $button.attr('value'));
    });

    await game.settings.set("enhancedcombathud", "echThemeData", formData);
    canvas.hud.enhancedcombathud?.setColorSettings();
  }
}

Hooks.once("init", function () {
  game.settings.register("enhancedcombathud", "echThemeData", {
    name: "Data used for Theming",
    type: Object,
    default: {
      theme: 'custom',
      font: 'Roboto',
      colors: {
        mainAction: {
          base: {
            background: '#414B55E6',
            color: '#B4D2DCFF',
            border: '#757f89FF'
          },
          hover: {
            background: '#414B55E6',
            color: '#B4D2DCFF',
            border: '#757f89FF'
          }
        },
        bonusAction: {
          base: {
            background: '#453B75E6',
            color: '#B4D2DCFF',
            border: '#757f89FF'
          },
          hover: {
            background: '#453B75E6',
            color: '#B4D2DCFF',
            border: '#757f89FF'
          }
        },
        freeAction: {
          base: {
            background: '#3B5875E6',
            color: '#B4D2DCFF',
            border: '#757f89FF'
          },
          hover: {
            background: '#3B5875E6',
            color: '#B4D2DCFF',
            border: '#757f89FF'
          }
        },
        reaction: {
          base: {
            background: '#753B3BE6',
            color: '#B4D2DCFF',
            border: '#757f89FF'
          },
          hover: {
            background: '#753B3BE6',
            color: '#B4D2DCFF',
            border: '#757f89FF'
          }
        },
        endTurn: {
          base: {
            background: '#374B3CE6',
            color: '#B4D2DCFF',
            border: '#757f89FF'
          },
          hover: {
            background: '#374B3CE6',
            color: '#B4D2DCFF',
            border: '#757f89FF'
          }
        },
        tooltip: {
          header: {
            background: '#ffffffCC',
            color: '#414146',
            border: '#757f89FF'
          },
          subtitle: {
            background: '#32505a',
            color: '#ffffff',
            border: '#757f89FF'
          },
          body: {
            background: '#5a7896B3',
            color: '#ffffff',
            border: '#757f89FF'
          }
        },
        abilityMenu: {
          background: '#414B55E6',
          color: '#B4D2DCFF',
          border: '#757f89FF'
        },
        buttons: {
          base: {
            background: '#5096c3',
            color: '#ffffff',
            border: '#5096c3'
          },
          hover: {
            background: '#55bef5',
            color: '#B4D2DCFF',
            border: '#55bef5'
          }
        },
        movement: {
          used: {
            background: '#7d879180',
            boxShadow: '#00000000'
          },
          baseMovement: {
            background: '#5abef5FF',
            boxShadow: '#6ed2ffCC'
          },
          dashMovement: {
            background: '#c8c85aFF',
            boxShadow: '#dcdc6eCC'
          },
          dangerMovement: {
            background: '#c85f5aFF',
            boxShadow: '#dc736eCC'
          }
        }
      }
    },
    scope: "world",
    config: false, // Doesn't show up in config
  })


  // Define a settings submenu which handles advanced configuration needs
  game.settings.registerMenu("enhancedcombathud", "echThemeOptions", {
    name: "My Settings Submenu",
    label: "The label which appears on the Settings submenu button",
    hint: "A description of what will occur in the submenu dialog.",
    icon: "fas fa-bars",
    type: echThemeOptions,
    restricted: false
  });

  game.settings.register("enhancedcombathud", "theme", {
    name: game.i18n.localize("enhancedcombathud.settings.theme.name"),
    hint: game.i18n.localize("enhancedcombathud.settings.theme.hint"),
    scope: "client",
    config: true,
    choices: {
      "custom": game.i18n.localize("enhancedcombathud.settings.theme.custom"),
      "helium": game.i18n.localize("enhancedcombathud.settings.theme.helium"),
      "neon": game.i18n.localize("enhancedcombathud.settings.theme.neon"),
      "argon": game.i18n.localize("enhancedcombathud.settings.theme.argon"),
      "krypton":  game.i18n.localize("enhancedcombathud.settings.theme.krypton"),
      "xenon": game.i18n.localize("enhancedcombathud.settings.theme.xenon"),
      "radon": game.i18n.localize("enhancedcombathud.settings.theme.radon"),
      "oganesson": game.i18n.localize("enhancedcombathud.settings.theme.oganesson"),
    },
    type: String,
    default: "custom",
    onChange: () => {canvas.hud.enhancedcombathud?.setColorSettings()}
  });

  game.settings.register("enhancedcombathud", "scale", {
    name: game.i18n.localize("enhancedcombathud.settings.scale.name"),
    hint: game.i18n.localize("enhancedcombathud.settings.scale.hint"),
    scope: "client",
    config: true,
    range: {
      min: 0.1,
      max: 2,
      step: 0.1,
    },
    type: Number,
    default: 1,
  });

  game.settings.register("enhancedcombathud", "noAutoscale", {
    name: game.i18n.localize("enhancedcombathud.settings.noAutoscale.name"),
    hint: game.i18n.localize("enhancedcombathud.settings.noAutoscale.hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register("enhancedcombathud", "leftPos", {
    name: game.i18n.localize("enhancedcombathud.settings.leftPos.name"),
    hint: game.i18n.localize("enhancedcombathud.settings.leftPos.hint"),
    scope: "client",
    config: true,
    type: Number,
    default: 15,
  });

  game.settings.register("enhancedcombathud", "botPos", {
    name: game.i18n.localize("enhancedcombathud.settings.botPos.name"),
    hint: game.i18n.localize("enhancedcombathud.settings.botPos.hint"),
    scope: "client",
    config: true,
    type: Number,
    default: 15,
  });

  game.settings.register("enhancedcombathud", "preparedSpells", {
    name: game.i18n.localize("enhancedcombathud.settings.preparedSpells.name"),
    hint: game.i18n.localize("enhancedcombathud.settings.preparedSpells.hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register("enhancedcombathud", "showTooltips", {
    name: game.i18n.localize("enhancedcombathud.settings.showTooltips.name"),
    hint: game.i18n.localize("enhancedcombathud.settings.showTooltips.hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register("enhancedcombathud", "showTooltipsSpecial", {
    name: game.i18n.localize("enhancedcombathud.settings.showTooltipsSpecial.name"),
    hint: game.i18n.localize("enhancedcombathud.settings.showTooltipsSpecial.hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
  });
});

//Color Settings


Hooks.once("ready", function () {
  new window.Ardittristan.ColorSetting("enhancedcombathud", "fore-color", {
    name: game.i18n.localize("enhancedcombathud.settings.fore-color.text"),
    hint: game.i18n.localize("enhancedcombathud.settings.fore-color.hint"),
    label: game.i18n.localize("enhancedcombathud.settings.color.label"),
    restricted: true,
    defaultColor: "#B4D2DCFF",
    scope: "world",
    onChange: () => {canvas.hud.enhancedcombathud?.setColorSettings()}
  });
  new window.Ardittristan.ColorSetting("enhancedcombathud", "color", {
    name: game.i18n.localize("enhancedcombathud.settings.color.text"),
    hint: game.i18n.localize("enhancedcombathud.settings.color.hint"),
    label: game.i18n.localize("enhancedcombathud.settings.color.label"),
    restricted: true,
    defaultColor: "#414B55E6",
    scope: "world",
    onChange: () => {canvas.hud.enhancedcombathud?.setColorSettings()}
  });
  new window.Ardittristan.ColorSetting("enhancedcombathud", "color-bonus-action", {
    name: game.i18n.localize("enhancedcombathud.settings.color-bonus-action.text"),
    hint: game.i18n.localize("enhancedcombathud.settings.color-bonus-action.hint"),
    label: game.i18n.localize("enhancedcombathud.settings.color.label"),
    restricted: true,
    defaultColor: "#453B75E6",
    scope: "world",
    onChange: () => {canvas.hud.enhancedcombathud?.setColorSettings()}
  });
  new window.Ardittristan.ColorSetting("enhancedcombathud", "color-free-action", {
    name: game.i18n.localize("enhancedcombathud.settings.color-free-action.text"),
    hint: game.i18n.localize("enhancedcombathud.settings.color-free-action.hint"),
    label: game.i18n.localize("enhancedcombathud.settings.color.label"),
    restricted: true,
    defaultColor: "#3B5875E6",
    scope: "world",
    onChange: () => {canvas.hud.enhancedcombathud?.setColorSettings()}
  });
  new window.Ardittristan.ColorSetting("enhancedcombathud", "color-reaction", {
    name: game.i18n.localize("enhancedcombathud.settings.color-reaction.text"),
    hint: game.i18n.localize("enhancedcombathud.settings.color-reaction.hint"),
    label: game.i18n.localize("enhancedcombathud.settings.color.label"),
    restricted: true,
    defaultColor: "#753B3BE6",
    scope: "world",
    onChange: () => {canvas.hud.enhancedcombathud?.setColorSettings()}
  });
  new window.Ardittristan.ColorSetting("enhancedcombathud", "color-end-turn", {
    name: game.i18n.localize("enhancedcombathud.settings.color-end-turn.text"),
    hint: game.i18n.localize("enhancedcombathud.settings.color-end-turn.hint"),
    label: game.i18n.localize("enhancedcombathud.settings.color.label"),
    restricted: true,
    defaultColor: "#374B3CE6",
    scope: "world",
    onChange: () => {canvas.hud.enhancedcombathud?.setColorSettings()}
  });

  new window.Ardittristan.ColorSetting("enhancedcombathud", "color-tooltip", {
    name: game.i18n.localize("enhancedcombathud.settings.color-tooltip.text"),
    hint: game.i18n.localize("enhancedcombathud.settings.color-tooltip.hint"),
    label: game.i18n.localize("enhancedcombathud.settings.color.label"),
    restricted: true,
    defaultColor: "#414B55E6",
    scope: "world",
    onChange: () => {canvas.hud.enhancedcombathud?.setColorSettings()}
  });

  /*game.settings.set("enhancedcombathud", "echThemeData", {
    theme: 'custom',
    font: 'Roboto',
    colors: {
      mainAction: {
        base: {
          background: '#414B55E6',
          color: '#B4D2DCFF',
          border: '#757f89FF'
        },
        hover: {
          background: '#414B55E6',
          color: '#B4D2DCFF',
          border: '#757f89FF'
        }
      },
      bonusAction: {
        base: {
          background: '#453B75E6',
          color: '#B4D2DCFF',
          border: '#757f89FF'
        },
        hover: {
          background: '#453B75E6',
          color: '#B4D2DCFF',
          border: '#757f89FF'
        }
      },
      freeAction: {
        base: {
          background: '#3B5875E6',
          color: '#B4D2DCFF',
          border: '#757f89FF'
        },
        hover: {
          background: '#3B5875E6',
          color: '#B4D2DCFF',
          border: '#757f89FF'
        }
      },
      reaction: {
        base: {
          background: '#753B3BE6',
          color: '#B4D2DCFF',
          border: '#757f89FF'
        },
        hover: {
          background: '#753B3BE6',
          color: '#B4D2DCFF',
          border: '#757f89FF'
        }
      },
      endTurn: {
        base: {
          background: '#374B3CE6',
          color: '#B4D2DCFF',
          border: '#757f89FF'
        },
        hover: {
          background: '#374B3CE6',
          color: '#B4D2DCFF',
          border: '#757f89FF'
        }
      },
      tooltip: {
        header: {
          background: '#ffffffCC',
          color: '#414146',
          border: '#757f89FF'
        },
        subtitle: {
          background: '#32505a',
          color: '#ffffff',
          border: '#757f89FF'
        },
        body: {
          background: '#5a7896B3',
          color: '#ffffff',
          border: '#757f89FF'
        }
      },
      abilityMenu: {
        background: '#414B55E6',
        color: '#B4D2DCFF',
        border: '#757f89FF',
        base: {
          color: '#B4D2DCFF',
          boxShadow: '#757f89CC'
        },
        hover: {
          color: '#B4D2DCFF',
          boxShadow: '#757f89CC'
        }
      },
      buttons: {
        base: {
          background: '#5096c3',
          color: '#ffffff',
          border: '#5096c3'
        },
        hover: {
          background: '#55bef5',
          color: '#B4D2DCFF',
          border: '#55bef5'
        }
      },
      movement: {
        used: {
          background: '#7d879180',
          boxShadow: '#00000000'
        },
        baseMovement: {
          background: '#5abef5FF',
          boxShadow: '#6ed2ffCC'
        },
        dashMovement: {
          background: '#c8c85aFF',
          boxShadow: '#dcdc6eCC'
        },
        dangerMovement: {
          background: '#c85f5aFF',
          boxShadow: '#dc736eCC'
        }
      }
    }
  })*/
});

Hooks.on("renderItemSheet", (itemsheet, html) => {
  let actionType = itemsheet.object.data.data.activation.type;
  let itemType = itemsheet.object.data.type;
  let echFlags = itemsheet.object.data.flags.enhancedcombathud;

  // Constant function that returns formatted label
  const labelTemplate = (set) => {
    return `<label class="checkbox">
      <input type="checkbox" 
        ${echFlags?.[set] ? "checked" : ""} 
        name="flags.enhancedcombathud.${set}"> 
        ${game.i18n.localize('enhancedcombathud.itemconfig.' + set + '.text')}
      </label>`;
  }

  const configHtmlElements = {
    start: `<div class="form-group stacked" id="test">
      <label>${game.i18n.localize("enhancedcombathud.itemconfig.sets.text")}</label>`,
    end: `</div>`
  };

  let confightml = configHtmlElements.start;

  if (actionType === "action" || itemType === "weapon" || itemType === "consumable") {
    confightml += `<div class="form-fields">`;
    confightml += labelTemplate('set1p');
    confightml += labelTemplate('set2p');
    confightml += labelTemplate('set3p');
    confightml += `</div>`;
  }
  if (actionType === "bonus" || itemType === "weapon" || itemType === "equipment") {
    confightml += `<div class="form-fields">`;
    confightml += labelTemplate('set1s');
    confightml += labelTemplate('set2s');
    confightml += labelTemplate('set3s');
    confightml += `</div>`;
  }
  confightml += configHtmlElements.end;

  html.find('div[class="form-group stacked"]').first().before(confightml);
});

Hooks.on("getSceneControlButtons", (controls, b, c) => {
  controls
    .find((x) => x.name == "token")
    .tools.push({
      active: false,
      icon: "ech-swords",
      name: "echtoggle",
      title: "Toggle",
      onClick: (toggle) => {
        if (toggle) {
          canvas.hud.enhancedcombathud.bind(_token);
        } else {
          canvas.hud.enhancedcombathud.close();
        }

        $(".ech-swords").parent().toggleClass("active", toggle);
      },
      toggle: true,
    });
});
Hooks.on("renderTokenHUD", (app, html, data) => {
  let $tokenHUDButton = $(
    `<div class="control-icon echtoggle"><i class="ech-swords"></i></div>`
  );
  $tokenHUDButton.toggleClass(
    "active",
    $('.control-tool[data-tool="echtoggle"]').hasClass("active")
  );

  html.find(".col.left").prepend($tokenHUDButton);
  html.find(".col.left").on("click", ".control-icon.echtoggle", (event) => {
    $('.control-tool[data-tool="echtoggle"]').trigger("click");
  });
});

Handlebars.registerHelper('echLocalize', (data, data2, data3) => {
  let str = `.${data}`;
  if (typeof data2 == 'string') str += `${data2.charAt(0).toUpperCase() + data2.slice(1)}`;
  if (typeof data3 == 'string') str += `${data3.charAt(0).toUpperCase() + data3.slice(1)}`;

  return game.i18n.localize(`enhancedcombathud.themeOptions${str}`)
})

Handlebars.registerHelper('ifObject', function(item, options) {
  if(typeof item === "object") {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('spellSlots', function (obj) {
  return CombatHudCanvasElement.generateSpells(obj);
})

Handlebars.registerHelper('hasUses', function (data) {
  let max = data.data.uses.max
  let current = data.data.uses.value
  let quantity = data.data.quantity
  if(quantity) return `class="feature-element has-count" data-item-count="${quantity}"`
  if(current) return `class="feature-element has-count" data-item-count="${current}"`
  return `class="feature-element"`
})

Handlebars.registerHelper('generateSavingThrows', (str) => {
  let data = canvas.hud.enhancedcombathud.hudData[str];
  let localize = canvas.hud.enhancedcombathud.hudData.settings.localize
  let html = '';
  let prof = {
    '0': 'not-proficient',
    '0.5': 'half-proficiency',
    '1': 'proficient',
    '2': 'expertise'
  }

  if (Object.entries(data).length > 0) {
    html += `<li class="ability ability-title">${'Abilities'} <div><span>Check</span><span>Save</span></div></li>`
  }

  for(let [key, value] of Object.entries(data)) {
    html += `<li class="ability is-${str.substring(0, str.length - 1)} proficiency-is-${prof[value.proficient]}" data-roll="${str == 'tools' ? value.label : key}" data-modifier="save" >
        <span class="ability-name">${value.label}</span> 
        <div style="margin-left: auto;">
          <span data-type="check">${value.mod < 0 ? value.mod : '+' + value.mod }</span> 
          <span data-type="save">${value.save < 0 ? value.save : '+' + value.save }</span> 
        </div>
      </li>`
  }


  return html;
})

Handlebars.registerHelper('generateAbilities', function (str) {
  let data = canvas.hud.enhancedcombathud.hudData[str];
  let localize = canvas.hud.enhancedcombathud.hudData.settings.localize
  let html = '';
  let prof = {
    '0': 'not-proficient',
    '0.5': 'half-proficiency',
    '1': 'proficient',
    '2': 'expertise'
  }
  let $dropdown = $('<select></select>');

  for (let [key, value] of Object.entries(game.dnd5e.config.abilities)) {
    $dropdown.append(`<option value="${key}">${value.substring(0,3)}</option>`);
  }

  if (Object.entries(data).length > 0) {
    html += `<li class="ability ability-title">${localize[str]}</li>`
  }

  for(let [key, value] of Object.entries(data)){
    $dropdown.find(`[selected]`).removeAttr('selected');
    $dropdown.find(`[value="${value.ability}"]`).attr('selected', true);

    html += `<li class="ability is-${str.substring(0, str.length - 1)} proficiency-is-${prof[value.proficient]}" data-roll="${str == 'tools' ? value.label : key}" data-modifier="${value.ability}" >
        <span class="ability-code">${$dropdown.prop('outerHTML')}</span> <span class="ability-name">${value.label}</span> <span style="margin-left: auto;"><span class="ability-modifier" data-ability="${value.ability}" data-skill="${key}">${value.total < 0 ? value.total : '+'+value.total }</span> <span class="ability-passive">(${value.passive})</span></span>
      </li>`
  }

  return html;
})

$('body').on('click', '.ability-menu .ability-toggle', (event) => {
  $('body').toggleClass('ech-show-ability-menu');
  let element = document.querySelector('.extended-combat-hud');
  let ratio = element.style.transform.replace(/[^0-9.]+/g, '');
  let scaleHeight = ($(window).height()-$('.portrait-hud').outerHeight()*ratio)/(ratio)-70;
  $('.ability-menu ul').first().css({
    'max-height': $('body').hasClass('ech-show-ability-menu') ? `${scaleHeight}px` : '0px'
  })
})
$('body').on('click', '#echThemeOptions li h4.toggleOptions', (event) => {
  let isOpened = $(event.currentTarget).closest('li').hasClass('show');

  $(event.currentTarget).closest('ul').find('li.show').removeClass('show');
  $(event.currentTarget).closest('li').toggleClass('show', !isOpened);
});