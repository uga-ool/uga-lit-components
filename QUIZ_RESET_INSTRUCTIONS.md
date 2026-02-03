# How to Allow Additional Quiz Attempts

The "Reset All Attempts" button has been removed from the quiz component. To allow a student to retake the quiz after reaching the maximum attempts, use one of the following approaches.

## Temporarily Increase Max Attempts

Set a higher `max-attempts` value on the quiz component, then change it back after the student completes the quiz:

```html
<uga-quiz quiz-id="quiz-1" max-attempts="10" ...></uga-quiz>
```

## eLC Built-in Options

For official records or course-wide resets, use eLC's built-in quiz or assignment reset features (e.g. reset attempts in the gradebook or assignment submission area).
