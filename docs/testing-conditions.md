# Testing Logo Generation Conditions

## Quick Reference

| Condition                     | Code | Description                                    | URL Example                                                      |
| ----------------------------- | ---- | ---------------------------------------------- | ---------------------------------------------------------------- |
| General                       | `g`  | Standard assistance without personalization    | `http://<ec2-ip>:3000/chat?responseId=<response_id>&condition=g` |
| Personalized                  | `p`  | Personalized assistance based on user's images | `http://<ec2-ip>:3000/chat?responseId=<response_id>&condition=p` |
| Personalized with Explanation | `f`  | Personalized with explicit style explanations  | `http://<ec2-ip>:3000/chat?responseId=<response_id>&condition=f` |

## How to Test

### 1. General Condition (g)

- URL: `http://<ec2-ip>:3000/chat?responseId=<response_id>&condition=g`
- Expected: Standard chat without references to personal style, no images panel

### 2. Personalized Condition (p)

- URL: `http://<ec2-ip>:3000/chat?responseId=<response_id>&condition=p`
- Requirements: User must have uploaded images in survey
- Expected: References to user's style without explanations, images panel visible

### 3. Personalized with Explanation (f)

- URL: `http://<ec2-ip>:3000/chat?responseId=<response_id>&condition=f`
- Requirements: User must have uploaded images in survey
- Expected: Detailed style analysis and explanations, images panel visible

## Fallback Behavior

- Missing condition: Defaults to general (g)
- Invalid condition: Defaults to general (g)
- No images for personalized: Falls back to general (g)

## Troubleshooting

If the condition behavior is not as expected:

1. Check that the responseId exists in the database
2. Verify that work samples are uploaded for personalized conditions
3. Check browser console for any API errors
