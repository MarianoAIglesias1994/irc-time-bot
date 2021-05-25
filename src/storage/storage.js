require("dotenv").config();
const fs = require("fs");

const getAll = function () {
  const file = fs.readFileSync(__dirname + process.env.STORAGE_FILE);
  return JSON.parse(file);
};

function getCount(list, timezone) {
  let selected;
  list.some(
    (i) =>
      (selected =
        i.timezone === timezone ? i.count : getCount(i.children, timezone))
  );
  return typeof selected != "undefined" ? selected : 0;
}

function addChild(list, timezone, parent, child) {
  parent = (timezone.includes("/") && timezone.split("/")[0]) || timezone;
  if (!list.some((i) => i.timezone === parent)) {
    const node = {
      timezone: parent,
      count: 0,
      children: [],
    };
    list.push(node);
    timezone = getChild(timezone);
    if (typeof timezone != "undefined") {
      return addChild(
        list[list.findIndex((i) => i.timezone == parent)].children,
        timezone,
        parent,
        child
      );
    } else {
      return list;
    }
  } else
    addChild(
      list[list.findIndex((i) => i.timezone == parent)].children,
      getChild(timezone),
      parent,
      child
    );
}

function updateNodes(list, timezone) {
  const child = getChild(timezone);
  if (typeof child != "undefined") {
    list.some((i) =>
      i.timezone === timezone.split("/")[0] ? i.count++ : null
    );
    list.some((i) =>
      i.timezone === timezone.split("/")[0]
        ? updateNodes(i.children, child)
        : null
    );
  } else {
    list.some((i) =>
      i.timezone === timezone.split("/")[0] ? i.count++ : null
    );
  }
}

function getParent(timezone) {
  fields = timezone.split("/");
  return fields[fields.length - 2];
}

function getNode(timezone) {
  fields = timezone.split("/");
  return fields[fields.length - 1];
}

function getChild(timezone) {
  fields = timezone.split("/");
  let child = fields[1];
  for (let i = 2; i < fields.length; i++) {
    child = child + "/" + fields[i];
  }
  return child;
}

exports.addOperationByTimezone = function (timezone) {
  var json = getAll();
  const node = getNode(timezone);
  if (getCount(json, node) == 0) {
    const child = {
      timezone: node,
      count: 0,
      children: [],
    };
    const parent = getParent(timezone);
    addChild(json, timezone, parent, child);
    updateNodes(json, timezone);
  } else {
    updateNodes(json, timezone);
  }
  fs.writeFileSync(__dirname + process.env.STORAGE_FILE, JSON.stringify(json));
};

exports.getAccountByTimezone = function (timezone) {
  return getCount(getAll(), getNode(timezone));
};
