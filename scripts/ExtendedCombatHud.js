class CombatHud {
  constructor(token) {
    this.token = token;
    this.actor = token.actor;
    this.actions = {
      attack: this.getItems({
        actionType: ["action"],
        itemType: ["weapon"],
        equipped: true,
      }),
      spells: this.getItems({
        actionType: ["action"],
        itemType: ["spell"],
        prepared: true,
      }),
      special: this.getItems({ actionType: ["action"], itemType: ["feat"] }),
      consumables: this.getItems({
        actionType: ["action"],
        itemType: ["consumable"],
      }),
    };
    this.bonus = {
      attack: this.getItems({
        actionType: ["bonus"],
        itemType: ["weapon"],
        equipped: true,
      }),
      spells: this.getItems({
        actionType: ["bonus"],
        itemType: ["spell"],
        prepared: true,
      }),
      special: this.getItems({ actionType: ["bonus"], itemType: ["weapone"] }),
      consumables: this.getItems({
        actionType: ["bonus"],
        itemType: ["consumable"],
      }),
    };
    this.reactions = {
      attack: this.getItems({
        actionType: ["reaction"],
        itemType: ["weapon"],
        equipped: true,
      }),
      spells: this.getItems({
        actionType: ["reaction"],
        itemType: ["spell"],
        prepared: true,
      }),
      special: this.getItems({
        actionType: ["reaction"],
        itemType: ["weapone"],
      }),
      consumables: this.getItems({
        actionType: ["reaction"],
        itemType: ["consumable"],
      }),
    };
    this.special = {};
    this.other = {
      portrait: this.actor.data.img,
      name: this.actor.data.name,
      maxHp: this.actor.data.data.attributes.hp.max,
      currHp: this.actor.data.data.attributes.hp.value,
      movement: Math.round(
        this.actor.data.data.attributes.movement.walk /
          canvas.dimensions.distance
      ),
      ac: this.actor.data.data.attributes.ac.value,
      classes: this.getClassesAsString(),
      specialItemsNames: {
        disengage: "Disengage",
        hide: "Hide",
        shove: "Shove",
        dash: "Dash",
        dodge: "Dodge",
        ready: "Ready",
      },
    };
    this.spellSlots = this.actor.data.data.spells;
    this.resources = {
      action: true,
      bonus: true,
      other: true,
    };
    this.sets = this.getSets();
    this.sets.active = this.actor.data.flags.enhancedcombathud?.activeSet
      ? this.sets[`set${this.actor.data.flags.enhancedcombathud?.activeSet}`]
      : this.sets.set1;
    this.resources = {
      action: true,
      bonus: true,
      reaction: true,
    };
    console.log(this);
  }
  getClassesAsString() {
    let classes = this.actor.data.data.classes;
    let string = "";
    for (let [key, value] of Object.entries(classes)) {
      string += "lvl " + value.levels + " ";
      string += key[0].toUpperCase() + key.substring(1);
      string += value.subclass
        ? " (" +
          value.subclass[0].toUpperCase() +
          value.subclass.substring(1) +
          ")"
        : "";
    }
    return string;
  }
  getItems(filters) {
    const actionType = filters.actionType;
    const itemType = filters.itemType;
    const equipped = filters.equipped;
    const prepared = filters.prepared;
    let items = this.actor.data.items;
    let filteredItems = items.filter((i) => {
      let itemData = i.data;
      if (equipped === true && !itemData.data.equipped) return false;
      if (prepared === true && itemData.data.preparation?.prepared === false)
        return false;
      if (
        actionType &&
        actionType.includes(itemData.data.activation?.type) &&
        itemType &&
        itemType.includes(itemData.type)
      )
        return true;
      return false;
    });
    let spells = {};
    if (prepared) {
      for (let item of filteredItems) {
        if (!spells[`${item.data.data.level}`])
          spells[`${item.data.data.level}`] = [];
        spells[`${item.data.data.level}`].push(item);
      }
    }
    if (filters.prepared === true) {
      return spells;
    } else {
      return filteredItems;
    }
  }
  findItemByName(itemName) {
    let items = this.actor.data.items;
    let item = items.find((i) => i.data.name == itemName);
    return item;
  }
  getSets() {
    let items = this.actor.data.items;
    let sets = {
      set1: {
        primary: null,
        secondary: null,
      },
      set2: {
        primary: null,
        secondary: null,
      },
    };
    for (let item of items) {
      if (item.data.flags.enhancedcombathud?.set1p) sets.set1.primary = item;
      if (item.data.flags.enhancedcombathud?.set2p) sets.set2.primary = item;
      if (item.data.flags.enhancedcombathud?.set1s) sets.set1.secondary = item;
      if (item.data.flags.enhancedcombathud?.set2s) sets.set2.secondary = item;
    }
    return sets;
  }
  _render() {
    canvas.hud.enhancedcombathud.bind(this.token);
  }
  switchSets() {
    if (this.sets.active == this.sets.set1) {
      this.sets.active = this.sets.set2;
    } else {
      this.sets.active = this.sets.set1;
    }
  }
  set hasAction(value) {
    $(canvas.hud.enhancedcombathud.element)
      .find('.actions-container.has-actions[data-actionbartype="action"]')
      .toggleClass("actions-used", !value);
  }
  set hasReaction(value) {
    $(canvas.hud.enhancedcombathud.element)
      .find('.actions-container.has-actions[data-actionbartype="reaction"]')
      .toggleClass("actions-used", !value);
  }
  set hasBonus(value) {
    $(canvas.hud.enhancedcombathud.element)
      .find('.actions-container.has-actions[data-actionbartype="bonus"]')
      .toggleClass("actions-used", !value);
  }
}

class CombatHudCanvasElement extends BasePlaceableHUD {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.template =
      "modules/enhancedcombathud/templates/extendedCombatHud.html";
    options.id = "enhancedcombathud";

    return options;
  }

  getData() {
    const data = super.getData();
    data.hudData = new CombatHud(this.object);
    this.hudData = data.hudData;
    return data;
  }

  setPosition() {
    if (!this.object) return;
    this.rigHtml();
    const position = {
      "z-index": 100,
      transform: "scale(0.8)",
    };
    this.element.css(position);
  }

  rigHtml() {
    this.clearEmpty();
    this.rigButtons();
    this.rigAccordion();
  }

  rigButtons() {
    let _this = this;
    this.element.unbind("click");
    this.element.on("click", '[data-type="trigger"]', async (event) => {
      let itemName = event.currentTarget.dataset.itemname;
      await this.addSpecialItem(itemName)
      await game.dnd5e.rollItemMacro(itemName); 
      let item = _this.hudData.findItemByName(itemName) ?? ECHItems[itemName];
      this.updateActionEconomy(item.data?.data?.activation?.type ?? item.data.activation.type);
      if (!item) {
        $(event.currentTarget).remove();
      } else {
        event.currentTarget.dataset.itemCount = item.data.data.quantity;
      }
    });
    this.element.on("click", '[data-type="menu"]', (event) => {
      let category = event.currentTarget.dataset.menu;
      // Hide Open Menus
      $(_this.element).find('div[data-iscontainer="true"]').removeClass("show");
      // Remove Active State from Menu Toggle
      $(_this.element).find('div[data-type="menu"]').removeClass("active");
      // Add Active State to Clicked Menu
      $(event.currentTarget).toggleClass('active');
      // Show Active Menu
      $(_this.element)
        .find(`div[class="features-container ${category}"]`)
        .toggleClass("show", $(event.currentTarget).hasClass('active'));
    });
    this.element.on("click", '[data-type="switchWeapons"]', async (event) => {
      let $element = $(event.currentTarget);

      if (!$element.hasClass('active')) {
        $(this.element).find('[data-type="switchWeapons"].active').removeClass('active');
        $element.addClass('active');
        this.switchSets();
      }
    });
  }

  rigAccordion() {
    let spellHudWidth = 375;
    this.element.find(".features-accordion").each((index, element) => {
      let $element = $(element);
      let numberOfFeatures = $element.find(".feature-element").length;

      spellHudWidth +=
        numberOfFeatures > 3 ? 450 + 53 : numberOfFeatures * 150 + 53;

      $element.css({
        width: `${
          numberOfFeatures > 3 ? 450 + 53 : numberOfFeatures * 150 + 53
        }px`,
      });
      $element.find(".features-accordion-content").css({
        "min-width": `${numberOfFeatures > 3 ? 450 : numberOfFeatures * 150}px`,
      });
    });

    // If container is smaller than window size, then open containers.
    this.element
      .find(".features-accordion")
      .toggleClass("show", spellHudWidth < $(window).width());

    // If container is larger than window, allow accordion usage
    //if (spellHudWidth > $(window).width()) {
      this.element.on("click", ".feature-accordion-title", (event) => {
        let $element = $(event.currentTarget);
        let $accordion = $element.closest(".features-accordion");
        let $container = $element.closest(".features-container");

        if ($container.width() + 503 > $(window).width()) {
          $container.find(".features-accordion").removeClass("show");
        }

        $accordion.toggleClass("show");
      });
    //}
  }

  clearEmpty() {
    let menuButtons = $(this.element).find('[data-type="menu"]');
    for (let button of menuButtons) {
      let category = button.dataset.actiontype;
      let itemType = button.dataset.itemtype;
      let objectToCheck = this.hudData[category][itemType];
      if (
        objectToCheck == [] ||
        objectToCheck == {} ||
        !objectToCheck ||
        objectToCheck.length == 0
      ) {
        $(button).remove();
      }
    }
  }

  switchSets() {
    this.hudData.switchSets();
    let primary = $(this.element).find('div[data-set="setp"]');
    let secondary = $(this.element).find('div[data-set="sets"]');
    this.updateSetElement(primary, this.hudData.sets.active.primary);
    //this.updateSetElement(secondary, this.hudData.sets.active.secondary);
  }
  updateSetElement(element, item) {
    element
      .data("itemname", item.name)
      .css({ "background-image": `url(${item.data.img})` })
      .find(".action-element-title")
      .text(item.name);
  }

  resetActionsUses() {
    this.hudData.hasAction = true;
    this.hudData.hasBonus = true;
    this.hudData.hasReaction = true;
  }

  updateActionEconomy(actionType) {
    switch (actionType) {
      case "action":
        this.hudData.hasAction = false;
        break;
      case "bonus":
        this.hudData.hasBonus = false;
        break;
      case "reaction":
        this.hudData.hasReaction = false;
        break;
    }
  }

  async addSpecialItem(itemName){
    if(!ECHItems[itemName]) return
    await this.hudData.actor.createOwnedItem(ECHItems[itemName])
  }
}

Hooks.once("init", () => {
  Hooks.on("renderHeadsUpDisplay", async (app, html, data) => {
    //html.append('<template id="enhancedcombathud"></template>');
    canvas.hud.enhancedcombathud = new CombatHudCanvasElement();
  });
});


