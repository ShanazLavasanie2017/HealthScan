using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace BlazorWASMShenAi.Client.Pages
{
    public partial class HealthScan : ComponentBase
    {
        [Inject]
        private IJSRuntime jsRun { get; set; }
        private string ApiKey { get; set; } = "9b6753712b744783a7a909465de3eaef";
        private bool isInitialized { get; set; }

        private int? heartRate { get; set; }
        private readonly string userId = Guid.NewGuid().ToString();

        private bool showRiskForm { get; set; }
        private RiskFormModel riskForm { get; set; } = new();
        private string errorMsg { get; set; }

        protected override async Task OnAfterRenderAsync(bool firstRender)
        {
            if (firstRender)
            {
                await Task.Delay(5000);
            }
        }

        private async Task StartShenAI()
        {
            try
            {
                var initialized = await jsRun.InvokeAsync<bool>("initializeShenAI", ApiKey, userId);
                if (!initialized)
                {
                    errorMsg = "Failed to initialize Shen.AI";
                    return;
                }
                //await jsRun.InvokeVoidAsync("startMeasurement");
            }
            catch (JSException jsEx)
            {
                errorMsg = $"JavaScript error: {jsEx.Message}";
            }
            catch (Exception ex)
            {
                errorMsg = $"Unexpected error: {ex.Message}";
            }
        }

        public class RiskFormModel
        {
            public int Age { get; set; }
            public double Cholesterol { get; set; }
            public double CholesterolHdl { get; set; }
            public double Sbp { get; set; }
            public bool Smoker { get; set; }
            public bool HypertensionTreatment { get; set; }
            public bool Diabetes { get; set; }
            public double BodyHeight { get; set; }
            public double BodyWeight { get; set; }
            public string Gender { get; set; }
            public string Country { get; set; }
            public string Race { get; set; }
        }
    }
}
