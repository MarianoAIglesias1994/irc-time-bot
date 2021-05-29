const cacheAdapter = require("axios-cache-adapter");
require("dotenv").config();
const constants = require("../bot_manager/constants");
const _axios = require("axios");
const axiosRetry = require("axios-retry");

const cache = cacheAdapter.setupCache({
  maxAge: 15 * 60 * 1000,
});

const axios = _axios.create({
  adapter: cache.adapter,
});

const retryDelay = (retryNumber = 0) => {
  const seconds = Math.pow(2, retryNumber) * 1000;
  const randomMs = 1000 * Math.random();
  return seconds + randomMs;
};

axiosRetry(axios, {
  retries: 2,
  retryDelay,
  // retry on Network Error & 5xx responses
  retryCondition: axiosRetry.isRetryableError,
});

buildApiRequest = function (timezone) {
  return process.env.TIME_API + process.env.TIME_API_ENDPOINT + timezone;
};

function getMinutesRemainder() {
  const d = new Date();
  const n = d.getMinutes();
  return 60 - n;
}

callApi = async function (url) {
  try {
    const response = await axios.get(url, {
      cache: {
        maxAge: getMinutesRemainder() * 60 * 1000,
        exclude: { query: false },
      },
    });
    const data = await response.data;
    if (Array.isArray(data)) {
      return {
        status: constants.UNKNOWN_TIMEZONE,
        data: null,
      };
    }
    return {
      status: constants.OK,
      data: data.datetime,
    };
  } catch (error) {
    if (error.response.status == 503) {
      return {
        status: constants.SERVICE_UNAVAILABLE,
        data: null,
      };
    }
    if (error.response.status == 404) {
      return {
        status: constants.UNKNOWN_TIMEZONE,
        data: null,
      };
    } else {
      return {
        status: constants.UNKNOWN_ERROR,
        data: null,
      };
    }
  }
};

formatApiResponse = function (iso8601Datetime) {
  // iso8601Datetime: '2021-05-23T01:50:55.760645-03:00'
  fields = iso8601Datetime.split("T");
  date = fields[0];
  time = fields[1];
  dateFields = date.split("-");
  timeFields = time.split(":");

  const year = dateFields[0];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthName = months[parseInt(dateFields[1]) - 1];
  const day = dateFields[2];

  const hour = timeFields[0];
  const minute = timeFields[1];

  const formattedApiResponse = `${day} ${monthName} ${year} ${hour}:${minute}`;
  return formattedApiResponse;
};

exports.getTimeAt = async function (timezone) {
  const url = buildApiRequest(timezone);
  const apiResponse = await callApi(url);
  if (apiResponse.status != constants.OK) {
    return {
      status: apiResponse.status,
      formattedApiResponse: null,
    };
  } else {
    const formattedApiResponse = formatApiResponse(apiResponse.data);
    return {
      status: apiResponse.status,
      formattedApiResponse: formattedApiResponse,
    };
  }
};
