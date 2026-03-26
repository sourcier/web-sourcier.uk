// Fetches approved comment submissions from Netlify Forms API.
// Requires two environment variables set in Netlify site settings:
//   NETLIFY_ACCESS_TOKEN — personal access token from https://app.netlify.com/user/applications
//   COMMENTS_FORM_ID     — form ID visible in the Netlify Forms dashboard after the first submission

export const handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  const slug = event.queryStringParameters?.slug;
  if (!slug) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Missing required query parameter: slug" }),
    };
  }

  const token = process.env.NETLIFY_ACCESS_TOKEN;
  const formId = process.env.COMMENTS_FORM_ID;

  if (!token || !formId) {
    console.warn(
      "NETLIFY_ACCESS_TOKEN or COMMENTS_FORM_ID not configured — returning empty comments"
    );
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ comments: [] }),
    };
  }

  const apiUrl = `https://api.netlify.com/api/v1/forms/${encodeURIComponent(formId)}/submissions`;
  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error(`Netlify API error: ${response.status} ${response.statusText}`);
    return {
      statusCode: 502,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Failed to fetch comments from Netlify API" }),
    };
  }

  const submissions = await response.json();

  const comments = submissions
    .filter((s) => s.data?.postSlug === slug)
    .map((s) => ({
      name: s.data.name,
      comment: s.data.comment,
      date: s.created_at,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ comments }),
  };
};
